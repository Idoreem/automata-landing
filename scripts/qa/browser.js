// איתור דפדפן מקומי לבדיקות — Windows / macOS / Linux, או BROWSER_PATH ידני
const fs = require("fs");

const CANDIDATES = [
  process.env.BROWSER_PATH,
  // Windows
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  // macOS
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  // Linux
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
].filter(Boolean);

function findBrowser() {
  const found = CANDIDATES.find((p) => {
    try {
      return fs.existsSync(p);
    } catch {
      return false;
    }
  });
  if (!found) {
    console.error(
      "לא נמצא Chrome/Edge. התקן אחד מהם או הגדר BROWSER_PATH לנתיב המלא של הדפדפן."
    );
    process.exit(2);
  }
  return found;
}

const DEFAULT_URL = "http://localhost:3000/landing";

module.exports = { findBrowser, DEFAULT_URL };
