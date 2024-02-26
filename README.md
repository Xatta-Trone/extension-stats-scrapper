# Extension Stats Scrapper

This script is designed to parse extension statistics data from [Chrome Stats](https://chrome-stats.com/d/bdkfodcnmgegolifeafnpbgjnjfohado) and [Firefox Stats](https://firefox-stats.com/d/medium-parser) websites. It runs every hour, fetching the latest data and storing it in `data-chrome.json` and `data-firefox.json` files.

# Usage

To use this script, follow these steps:
- Ensure you have the required dependencies installed.
- Run the script periodically to keep the data up-to-date.
- Access the parsed data in the generated `data-chrome.json`, `data-firefox.json` and `data-table.pdf` files.

# Dependencies

Make sure you have the necessary dependencies installed before running the script. You can install them using the following command:
```bash
npm install
```

# Example Usage


```bash
node chrome.js // or node firefox.js // node pdf.js
```

# Generated Files

- `data-chrome.json`: Contains parsed extension statistics data from Chrome Stats.
- `data-firefox.json`: Contains parsed extension statistics data from Firefox Stats.
- `data-table.pdf`: Contains parsed extension statistics data in a PDF format.

# Notes

This script is set to run every hour using Github Actions to ensure up-to-date statistics. Customize the script to fit your needs or integrate it into your workflow as required.

# Disclaimer

This script relies on the structure of the provided URLs, and any changes to the website layout may affect its functionality. Use with caution and check for updates if issues arise.



# Keywords:
- Puppeteer
- Github Actions
- Chrome Extension Stats
- Firefox Extension Stats

##  Feel free to contribute or report issues!
