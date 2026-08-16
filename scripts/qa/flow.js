// E2E: מילוי הטופס → שליחה → נחיתה בדף התודה.
// ⚠️ שולח ליד בדיקה אמיתי (שם "בדיקה אוטומטית") — אם ה-webhook מחובר, לסנן אותו ב-CRM.
// שימוש: npm run qa:flow [-- <url>]
const puppeteer = require("puppeteer-core");
const { findBrowser, DEFAULT_URL } = require("./browser");

(async () => {
  const base = process.argv[2] || DEFAULT_URL;
  const b = await puppeteer.launch({
    executablePath: findBrowser(),
    headless: "new",
    args: ["--disable-gpu", "--hide-scrollbars"],
  });
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844 });
  await p.goto(base, { waitUntil: "domcontentloaded", timeout: 45000 });
  await new Promise((r) => setTimeout(r, 1500));

  await p.type('input[name="name"]', "בדיקה אוטומטית");
  await p.type('input[name="email"]', "qa-test@automata.test");
  await p.type('input[name="phone"]', "0500000000");
  await p.click('input[name="consent"]');
  await p.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 4000));

  const url = p.url();
  const ok = await p.evaluate(() =>
    document.body.textContent.includes("הוואטסאפ בדרך אליך")
  );
  console.log("אחרי שליחה:", url, "| דף תודה:", ok ? "✓" : "✗");
  await b.close();
  process.exit(url.includes("/thanks") && ok ? 0 : 1);
})();
