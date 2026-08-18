/**
 * טקסט ממורכז רב-שורות.
 *
 * הבעיה שזה פותר: כשמרכזים פסקה עם שבירות שורה מהקופי (\n), שורה ארוכה
 * שנשברת במובייל משאירה מילה בודדת באמצע המסך. זה נראה שבור.
 *
 * הפתרון: כל שורה מהקופי היא בלוק בפני עצמו עם text-wrap: balance, כך
 * שהיא נשברת לשתי שורות מאוזנות. בדפדפן ישן זה פשוט נשבר כרגיל.
 *
 * highlight (אופציונלי): קטע בתוך הטקסט שמקבל עיצוב נפרד, למשל סכום
 * החיסכון. אם הקופי משתנה וההדגשה כבר לא נמצאת בו, הטקסט פשוט מוצג רגיל.
 */
export default function BalancedText({
  text,
  highlight,
  highlightClass,
  lineClass = "balanced-line",
}: {
  text: string;
  highlight?: string;
  highlightClass?: string;
  lineClass?: string;
}) {
  return (
    <>
      {text.split("\n").map((line, i) => {
        const canSplit = Boolean(highlight) && line.includes(highlight as string);
        if (!canSplit) {
          return (
            <span key={i} className={lineClass}>
              {line}
            </span>
          );
        }
        const [before, after] = line.split(highlight as string);
        return (
          <span key={i} className={lineClass}>
            {before}
            <span className={highlightClass}>{highlight}</span>
            {after}
          </span>
        );
      })}
    </>
  );
}
