// בדיקת נכסים: אפס בקשות שבורות + תמונת ההירו נטענת.
// שימוש: npm run qa:assets [-- <url>]
const puppeteer = require("puppeteer-core");
const { findBrowser, DEFAULT_URL } = require("./browser");

(async () => {
  const url = process.argv[2] || DEFAULT_URL;
  const b = await puppeteer.launch({
    executablePath: findBrowser(),
    headless: "new",
    args: ["--disable-gpu"],
  });
  const p = await b.newPage();
  const errs = [];
  p.on("requestfailed", (r) => errs.push("FAIL " + r.url().slice(0, 110)));
  p.on("response", (r) => {
    // _vercel/insights לא קיים לוקאלית - לא כשל אמיתי
    if (r.status() >= 400 && !r.url().includes("_vercel/insights"))
      errs.push(r.status() + " " + r.url().slice(0, 110));
  });
  await p.setViewport({ width: 390, height: 844 });
  await p.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise((r) => setTimeout(r, 2500));
  const imgOk = await p.evaluate(() => {
    const img = document.querySelector("img");
    return img ? img.naturalWidth > 0 : false;
  });
  console.log("שגיאות נכסים:", errs.length ? errs.slice(0, 8) : "אין ✓");
  console.log("תמונת הירו נטענה:", imgOk ? "✓" : "✗");
  await b.close();
  process.exit(errs.length === 0 && imgOk ? 0 : 1);
})();
