/** @format */

import puppeteer from "puppeteer";
import fs from "fs";

const FirefoxParser = {
  parse: async (addonId) => {
    console.log(addonId);

    let data = {};

    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
    });

    const page = await browser.newPage();
    await page.goto(`https://firefox-stats.com/d/${addonId}`, {
      waitUntil: "domcontentloaded",
    });

    const mappings = {
      title: "/html/body/div[1]/section/main/div[1]/div/div[1]/div[2]/h1",
      description: "/html/body/div[1]/section/main/div[1]/div/div[1]/div[2]/h2",
      author: "/html/body/div[1]/section/main/div[4]/div[1]/div[1]/span[2]/a",
      users: "/html/body/div[1]/section/main/div[4]/div[1]/div[3]/a[1]",
      usersChange: "/html/body/div[1]/section/main/div[4]/div[1]/div[3]/a[2]",
      ratings: "/html/body/div[1]/section/main/div[4]/div[1]/div[4]/a[1]",
      weeklyDownloads:
        "/html/body/div[1]/section/main/div[4]/div[1]/div[7]/span[2]",
      version: "/html/body/div[1]/section/main/div[4]/div[1]/div[5]/span[2]/a",
      lastUpdated:
        "/html/body/div[1]/section/main/div[4]/div[1]/div[5]/span[3]",
      createdAt: "/html/body/div[1]/section/main/div[4]/div[1]/div[6]/span[2]",
      size: "/html/body/div[1]/section/main/div[4]/div[1]/div[12]/span[2]",
      storeRank: "/html/body/div[1]/section/main/div[4]/div[2]/div[1]/div[1]/a",
      storeRankChange:
        "/html/body/div[1]/section/main/div[4]/div[2]/div[1]/div[1]/a/span",
      detailDescription: "/html/body/div[1]/section/main/div[7]/div/div",
    };

    const urlMappings = {
      storeLink:
        "/html/body/div[1]/section/main/div[4]/div[1]/div[2]/span/a/@href",
      website:
        "/html/body/div[1]/section/main/div[4]/div[1]/div[14]/span[2]/a/@href",
      promoImage: "/html/body/div[1]/section/main/div[1]/img/@src",
      logo: "/html/body/div[1]/section/main/div[1]/div/div[1]/div[1]/img/@src",
    };

    for (const [key, value] of Object.entries(mappings)) {
      console.log(`${key}: ${value}`);
      let val = await FirefoxParser.getText(
        page,
        value,
        key == "detailDescription"
      );

      if (val != null) {
        console.log(key, val);
        data[key] = val;
      }
    }

    for (const [key, value] of Object.entries(urlMappings)) {
      //   console.log(key, value);
      const nodeData = await page.$x(value);
      if (nodeData.length == 1) {
        const urlData = await page.evaluate(
          (el) => el.textContent,
          nodeData[0]
        );
        // console.log(urlData);
        if (urlData != undefined && urlData.length > 0) {
          console.log(key, urlData);
          data[key] = urlData;
        }
      }
    }

    // screenshots
    // images $x('/html/body/div[1]/section/main/div[11]/a')
    let imagesEl = await page.$x(
      "/html/body/div[1]/section/main/div[11]/a/descendant::img/@src"
    );
    let images = [];
    if (imagesEl.length > 0) {
      images = await page.evaluate((...imagesEl) => {
        return imagesEl.map((e) => {
          console.log(e);
          return e.textContent ?? "";
        });
      }, ...imagesEl);
    }

    if (images.length > 0) {
      data.images = images.filter((e) => e.length > 0);
    }

    // do the chores
    if (
      data.storeRank != undefined &&
      data.storeRank != null &&
      data.storeRankChange != undefined &&
      data.storeRankChange != null
    ) {
      data.storeRank = data.storeRank.replace(data.storeRankChange, "").trim();
    }

    // fix last updated
    if (data.lastUpdated != null && data.lastUpdated != undefined) {
      const date = data.lastUpdated.match(/\d{4}.\d{2}.\d{2}/g);
      if (date.length > 0) {
        data.lastUpdated = date[0].trim();
      }
    }

    // console.log(data);
    const hasKeys = !!Object.keys(data).length;

    // save the data
    if (hasKeys) {
      data.lastRun = new Date().toUTCString();
      // save to json
      fs.writeFile(
        "data-firefox.json",
        JSON.stringify(data, null, 4),
        (err) => {
          console.log(err);
        }
      );

      let dailyData = JSON.parse(fs.readFileSync("daily-data.json", "utf-8"));
      const todaysDateKey = new Date().toISOString().slice(0, 10);

      if (dailyData.hasOwnProperty(todaysDateKey)) {
        dailyData[todaysDateKey] = {
          ...dailyData[todaysDateKey],
          firefoxUsers: data.users.replaceAll(",", ""),
          firefoxStoreRank: data.storeRank,
          firefoxRating: data.ratings.slice(0, 4),
        };
      } else {
        dailyData[todaysDateKey] = {
          firefoxUsers: data.users.replaceAll(",", ""),
          firefoxStoreRank: data.storeRank,
          firefoxRating: data.ratings.slice(0, 4),
        };
      }

      fs.writeFile(
        "daily-data.json",
        JSON.stringify(dailyData, null, 4),
        (err) => {
          console.log(err);
        }
      );
    }

    await browser.close();
  },

  getText: async (page, xpath, extractHTML = false) => {
    const getNode = await page.$x(xpath);

    if (getNode.length == 1) {
      const nodeData = extractHTML
        ? await page.evaluate((el) => el.innerHTML, getNode[0])
        : await page.evaluate((el) => el.innerText, getNode[0]);

      console.log("nodeData", nodeData);
      if (nodeData != undefined && nodeData.length > 0) {
        return nodeData
          .trim()
          .replace(/\s{2,}/g, " ")
          .replace("\n", "")
          .replace(/^\s+|\s+$/g, "")
          .replace("   ", " ")
          .trim();
      }
      return null;
    }
    return null;
  },
};

// run the parser
FirefoxParser.parse("medium-parser");
