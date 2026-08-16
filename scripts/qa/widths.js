// בדיקת גלישה אופקית ברוחבי מסך נפוצים — חייב להיות 0 בכולם.
// שימוש: npm run qa:widths [-- <url>]
const puppeteer = require("puppeteer-core");
const { findBrowser, DEFAULT_URL } = require("./browser");

(async () => {
  const url = process.argv[2] || DEFAULT_URL;
  const b = await puppeteer.launch({
    executablePath: findBrowser(),
    headless: "new",
    args: ["--disable-gpu", "--hide-scrollbars"],
  });
  let bad = 0;
  for (const w of [320, 360, 390, 430, 768, 844]) {
    const p = await b.newPage();
    await p.setViewport({ width: w, height: 900 });
    await p.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await p.evaluate(async () => {
      await new Promise((res) => {
        let y = 0;
        const step = () => {
          y += 500;
          window.scrollTo(0, y);
          if (y < document.body.scrollHeight + 900) setTimeout(step, 80);
          else res();
        };
        step();
      });
    });
    await new Promise((r) => setTimeout(r, 1500));
    const overflow = await p.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    console.log(`${w}px → גלישה אופקית: ${overflow}px ${overflow === 0 ? "✓" : "✗"}`);
    if (overflow !== 0) bad++;
    await p.close();
  }
  await b.close();
  process.exit(bad === 0 ? 0 : 1);
})();
