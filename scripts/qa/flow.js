// E2E: מעבר בשלושת שלבי הטופס עד דף התודה.
// ⚠️ שולח ליד בדיקה אמיתי (שם "בדיקה") - אם ה-webhook מחובר, לסנן אותו ב-CRM.
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
  await new Promise((r) => setTimeout(r, 1600));

  const steps = [
    ["#lead-name", "בדיקה"],
    ["#lead-email", "qa-test@automata.test"],
    ["#lead-phone", "0500000000"],
  ];

  for (const [sel, val] of steps) {
    await p.waitForSelector(sel, { timeout: 10000 });
    await p.type(sel, val);
    if (sel !== "#lead-phone") {
      await p.click(".step-primary");
      await new Promise((r) => setTimeout(r, 700));
    }
  }

  await p.click('input[type="checkbox"]');
  await p.click(".step-primary");
  await new Promise((r) => setTimeout(r, 4500));

  const url = p.url();
  const ok = await p.evaluate(() =>
    document.body.textContent.includes("הוואטסאפ בדרך אליך")
  );
  console.log("אחרי שליחה:", url, "| דף תודה:", ok ? "✓" : "✗");
  await b.close();
  process.exit(url.includes("/thanks") && ok ? 0 : 1);
})();
