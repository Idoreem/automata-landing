"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LazyMotion, domAnimation, m, MotionConfig } from "framer-motion";
import { copy } from "@/lib/copy";

type Status = "idle" | "sending" | "error";

// Enter בשדה אמצעי עובר לשדה הבא במקום לשלוח טופס חצי-ריק
function focusNextOnEnter(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key !== "Enter") return;
  e.preventDefault();
  const form = e.currentTarget.form;
  if (!form) return;
  const fields = Array.from(
    form.querySelectorAll<HTMLInputElement>("input.field")
  );
  const idx = fields.indexOf(e.currentTarget);
  fields[idx + 1]?.focus();
}

export default function LeadForm() {
  const [status, setStatus] = useState<Status>("idle");
  const router = useRouter();
  const { form, ui } = copy;

  useEffect(() => {
    router.prefetch("/thanks");
  }, [router]);

  async function submitLead(data: Record<string, FormDataEntryValue>) {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(String(res.status));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");

    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      try {
        await submitLead(data);
      } catch {
        // ניסיון חוזר שקט אחד — מכסה 429 רגעי או נפילת רשת
        await new Promise((r) => setTimeout(r, 2500));
        await submitLead(data);
      }
      // חתימה לאירוע ה-Lead של הפיקסל: נורה רק אחרי שליחה אמיתית, פעם אחת
      try {
        sessionStorage.setItem("lead_submitted", crypto.randomUUID());
      } catch {}
      router.push("/thanks");
    } catch {
      setStatus("error");
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
      <section
        id="form"
        style={{
          position: "relative",
          padding: "clamp(80px, 12vw, 140px) 0",
          background: "var(--bg-form)",
          scrollMarginTop: 40,
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 700px 500px at 50% 50%, rgba(77, 141, 255, 0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            padding: "0 24px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <m.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            style={{
              fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.3,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            {form.h2line1}
            <br />
            {form.h2line2}
          </m.h2>

          <m.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
              color: "#aab4c8",
              lineHeight: 1.7,
              textAlign: "center",
              marginBottom: 28,
              whiteSpace: "pre-line",
            }}
          >
            {form.subtext}
          </m.p>

          {/* בלוק עלות הדחייה — הארג'נסי הכן היחיד בדף */}
          <m.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{
              fontSize: "clamp(1.05rem, 2vw, 1.3rem)",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.7,
              textAlign: "center",
              margin: "0 0 40px",
              whiteSpace: "pre-line",
            }}
          >
            {form.preCard}
          </m.p>

          <m.div
            initial={{ opacity: 0, filter: "blur(4px)", scale: 0.94 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            style={{
              background: "var(--card)",
              border: "1px solid rgba(77, 141, 255, 0.55)",
              borderRadius: 20,
              padding: "clamp(32px, 5vw, 56px) clamp(24px, 4vw, 40px)",
              boxShadow:
                "0 0 60px rgba(77, 141, 255, 0.12), 0 0 120px rgba(77, 141, 255, 0.06)",
            }}
          >
            <form
              onSubmit={handleSubmit}
              autoComplete="on"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                maxWidth: 440,
                margin: "0 auto",
              }}
            >
              {/* פיתיון לבוטים — שם שמילוי אוטומטי של דפדפנים לא מזהה */}
              <input
                className="hp-field"
                type="text"
                name="notes_hp"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div className="field-wrap">
                <label htmlFor="lead-name" className="float-label" aria-hidden>
                  {ui.fields.name}
                </label>
                <label htmlFor="lead-name" className="sr-only">
                  {ui.fields.name}
                </label>
                <input
                  id="lead-name"
                  className="field"
                  type="text"
                  name="name"
                  placeholder={ui.fields.name}
                  autoComplete="name"
                  autoCapitalize="words"
                  enterKeyHint="next"
                  minLength={2}
                  maxLength={120}
                  required
                  onKeyDown={focusNextOnEnter}
                  onInvalid={(e) => e.currentTarget.setCustomValidity(ui.validation.name)}
                  onInput={(e) => e.currentTarget.setCustomValidity("")}
                />
              </div>

              <div className="field-wrap">
                <label htmlFor="lead-email" className="float-label" aria-hidden>
                  {ui.fields.email}
                </label>
                <label htmlFor="lead-email" className="sr-only">
                  {ui.fields.email}
                </label>
                <input
                  id="lead-email"
                  className="field field-ltr"
                  type="email"
                  name="email"
                  placeholder={ui.fields.email}
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  enterKeyHint="next"
                  maxLength={200}
                  required
                  onKeyDown={focusNextOnEnter}
                  onInvalid={(e) => e.currentTarget.setCustomValidity(ui.validation.email)}
                  onInput={(e) => e.currentTarget.setCustomValidity("")}
                />
              </div>

              <div className="field-wrap">
                <label htmlFor="lead-phone" className="float-label" aria-hidden>
                  {ui.fields.phone}
                </label>
                <label htmlFor="lead-phone" className="sr-only">
                  {ui.fields.phone}
                </label>
                <input
                  id="lead-phone"
                  className="field field-ltr"
                  type="tel"
                  name="phone"
                  placeholder={ui.fields.phone}
                  autoComplete="tel"
                  inputMode="tel"
                  enterKeyHint="done"
                  pattern="[0-9+\-\s]{9,20}"
                  maxLength={20}
                  required
                  onInvalid={(e) => e.currentTarget.setCustomValidity(ui.validation.phone)}
                  onInput={(e) => e.currentTarget.setCustomValidity("")}
                />
              </div>

              <label
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  fontSize: "0.82rem",
                  color: "#aab4c8",
                  lineHeight: 1.55,
                  textAlign: "right",
                  marginTop: 4,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  name="consent"
                  required
                  style={{
                    width: 18,
                    height: 18,
                    marginTop: 3,
                    accentColor: "var(--accent)",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                />
                <span>{copy.consent}</span>
              </label>

              {/* קישור המדיניות מחוץ ללייבל — שלא תבוטל הסכמה בטעות בניסיון לקרוא */}
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#78828f",
                  margin: "-6px 28px 0 0",
                }}
              >
                {ui.privacyLinkPrefix}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "var(--accent)",
                    textDecoration: "underline",
                    display: "inline-block",
                    padding: "4px 0",
                  }}
                >
                  {ui.privacyLinkText}
                  <span className="sr-only"> {ui.newTabNote}</span>
                </a>
              </p>

              <button
                type="submit"
                className="cta-btn"
                disabled={status === "sending"}
                aria-live="polite"
                style={{
                  fontSize: "clamp(1.05rem, 1.8vw, 1.2rem)",
                  padding: "18px 32px",
                  borderRadius: 8,
                  marginTop: 6,
                  opacity: status === "sending" ? 0.7 : 1,
                }}
              >
                {status === "sending" ? (
                  <>
                    <span className="spinner" aria-hidden />
                    {ui.sending}
                  </>
                ) : (
                  form.submit
                )}
              </button>

              {status === "error" && (
                <p
                  role="alert"
                  style={{
                    color: "#ff9d9d",
                    fontSize: "0.85rem",
                    textAlign: "center",
                    margin: 0,
                  }}
                >
                  {ui.submitError}
                </p>
              )}

              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#78828f",
                  textAlign: "center",
                  margin: "6px 0 0",
                }}
              >
                {form.safety}
              </p>
            </form>
          </m.div>
        </div>
      </section>
      </LazyMotion>
    </MotionConfig>
  );
}
