/** @format */

import puppeteer from "puppeteer";
import fs from "fs";
import Handlebars from "handlebars";

let chromeData = JSON.parse(fs.readFileSync("data-chrome.json", "utf-8"));
let firefoxData = JSON.parse(fs.readFileSync("data-firefox.json", "utf-8"));

const pdfGenerator = {
  parse: async () => {
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
    });

    const page = await browser.newPage();

    var source = fs.readFileSync("pdf.html", "utf-8");
    var template = Handlebars.compile(source);

    var data = {
      chrome: chromeData,
      firefox: firefoxData,
    };
    var result = template(data);

    await page.setContent(result);

    const pdfConfig = {
      path: "data-table.pdf", // Saves pdf to disk.
      format: "A4",
      printBackground: true,
      margin: {
        // Word's default A4 margins
        top: "1.5cm",
        bottom: "1.5cm",
        left: "1.5cm",
        right: "1.5cm",
      },
    };
    await page.emulateMediaType("screen");

    await page.pdf(pdfConfig);

    await browser.close();
  },
};

// run the parser
pdfGenerator.parse();
