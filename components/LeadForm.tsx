"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, LazyMotion, domAnimation, m, MotionConfig } from "framer-motion";
import { copy } from "@/lib/copy";
import { BASE_PATH } from "@/lib/site";

type Status = "idle" | "sending" | "error";
type FieldKey = "name" | "email" | "phone";

type StepDef = {
  key: FieldKey;
  type: "text" | "email" | "tel";
  autoComplete: string;
  inputMode?: "email" | "tel";
  enterKeyHint: "next" | "done";
  ltr?: boolean;
  validate: (v: string) => string | null;
};

const STEPS: StepDef[] = [
  {
    key: "name",
    type: "text",
    autoComplete: "given-name",
    enterKeyHint: "next",
    validate: (v) => (v.trim().length >= 2 ? null : copy.ui.validation.name),
  },
  {
    key: "email",
    type: "email",
    autoComplete: "email",
    inputMode: "email",
    enterKeyHint: "next",
    ltr: true,
    validate: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : copy.ui.validation.email,
  },
  {
    key: "phone",
    type: "tel",
    autoComplete: "tel",
    inputMode: "tel",
    enterKeyHint: "done",
    ltr: true,
    validate: (v) => {
      const digits = v.replace(/\D/g, "");
      return digits.length >= 8 && digits.length <= 15 ? null : copy.ui.validation.phone;
    },
  },
];

export default function LeadForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<FieldKey, string>>({
    name: "",
    email: "",
    phone: "",
  });
  const [consent, setConsent] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [hp, setHp] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const startedRef = useRef(false);
  const { form, ui } = copy;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  useEffect(() => {
    router.prefetch("/thanks");
  }, [router]);

  // פוקוס אוטומטי על השדה הפעיל, אבל לא בטעינה הראשונה (שלא יקפוץ הדף למטה)
  useEffect(() => {
    if (!startedRef.current) return;
    const t = setTimeout(() => inputRef.current?.focus(), 260);
    return () => clearTimeout(t);
  }, [step]);

  function setValue(v: string) {
    setValues((prev) => ({ ...prev, [current.key]: v }));
    if (fieldError) setFieldError(null);
  }

  function goNext() {
    const err = current.validate(values[current.key]);
    if (err) {
      setFieldError(err);
      return;
    }
    startedRef.current = true;
    setFieldError(null);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function goBack() {
    startedRef.current = true;
    setFieldError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  async function postLead() {
    const res = await fetch(`${BASE_PATH}/api/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, consent, notes_hp: hp }),
    });
    if (!res.ok) throw new Error(String(res.status));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;

    const err = current.validate(values[current.key]);
    if (err) {
      setFieldError(err);
      return;
    }
    if (!consent) {
      setFieldError("צריך לאשר כדי שנוכל לחזור אליך");
      return;
    }

    setStatus("sending");
    try {
      try {
        await postLead();
      } catch {
        // ניסיון חוזר שקט אחד. מכסה חסימת קצב רגעית או נפילת רשת
        await new Promise((r) => setTimeout(r, 2500));
        await postLead();
      }
      try {
        sessionStorage.setItem("lead_submitted", crypto.randomUUID());
      } catch {}
      router.push("/thanks");
    } catch {
      setStatus("error");
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    if (isLast) return; // בשלב האחרון הטופס נשלח רגיל
    e.preventDefault();
    goNext();
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
                fontSize: "clamp(1rem, 1.8vw, 1.18rem)",
                color: "#aab4c8",
                lineHeight: 1.85,
                textAlign: "center",
                marginBottom: 26,
                whiteSpace: "pre-line",
                maxWidth: 640,
                marginInline: "auto",
              }}
            >
              {form.subtext}
            </m.p>

            <m.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              style={{
                fontSize: "clamp(1.05rem, 2vw, 1.28rem)",
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.7,
                textAlign: "center",
                margin: "0 0 38px",
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
                padding: "clamp(30px, 5vw, 52px) clamp(22px, 4vw, 40px)",
                boxShadow:
                  "0 0 60px rgba(77, 141, 255, 0.12), 0 0 120px rgba(77, 141, 255, 0.06)",
                maxWidth: 520,
                marginInline: "auto",
              }}
            >
              {/* מד התקדמות */}
              <div className="step-head">
                <div className="step-bar" aria-hidden>
                  {STEPS.map((s, i) => (
                    <span key={s.key} className={`step-seg${i <= step ? " on" : ""}`} />
                  ))}
                </div>
                <span className="step-count">
                  {form.stepLabel} {step + 1} {form.stepOf} {STEPS.length}
                </span>
              </div>

              <form onSubmit={handleSubmit} autoComplete="on" noValidate>
                {/* פיתיון לבוטים */}
                <input
                  className="hp-field"
                  type="text"
                  name="notes_hp"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={hp}
                  onChange={(e) => setHp(e.target.value)}
                />

                <AnimatePresence mode="wait" initial={false}>
                  <m.div
                    key={current.key}
                    initial={{ opacity: 0, x: 26 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -26 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <label htmlFor={`lead-${current.key}`} className="step-label">
                      {ui.fields[current.key]}
                    </label>
                    <input
                      ref={inputRef}
                      id={`lead-${current.key}`}
                      className={`field field-lg${current.ltr ? " field-ltr" : ""}`}
                      type={current.type}
                      name={current.key}
                      value={values[current.key]}
                      onChange={(e) => setValue(e.target.value)}
                      onKeyDown={onKeyDown}
                      placeholder={ui.fields[current.key]}
                      autoComplete={current.autoComplete}
                      inputMode={current.inputMode}
                      enterKeyHint={current.enterKeyHint}
                      autoCapitalize={current.key === "name" ? "words" : "none"}
                      spellCheck={false}
                      maxLength={current.key === "email" ? 200 : current.key === "phone" ? 20 : 120}
                      aria-invalid={Boolean(fieldError)}
                      aria-describedby={fieldError ? "step-error" : undefined}
                    />
                  </m.div>
                </AnimatePresence>

                {/* ההסכמה נדרשת רק בשלב האחרון */}
                {isLast && (
                  <m.label
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className="consent-row"
                  >
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => {
                        setConsent(e.target.checked);
                        if (fieldError) setFieldError(null);
                      }}
                      style={{
                        width: 20,
                        height: 20,
                        marginTop: 2,
                        accentColor: "var(--accent)",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    />
                    <span>{copy.consent}</span>
                  </m.label>
                )}

                {fieldError && (
                  <p id="step-error" role="alert" className="step-error">
                    {fieldError}
                  </p>
                )}

                <div className="step-actions">
                  {isLast ? (
                    <button
                      type="submit"
                      className="cta-btn step-primary"
                      disabled={status === "sending"}
                      aria-live="polite"
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
                  ) : (
                    <button type="button" className="cta-btn step-primary" onClick={goNext}>
                      {form.next}
                    </button>
                  )}

                  {step > 0 && (
                    <button type="button" className="step-back" onClick={goBack}>
                      {form.back}
                    </button>
                  )}
                </div>

                {status === "error" && (
                  <p role="alert" className="step-error" style={{ textAlign: "center" }}>
                    {ui.submitError}
                  </p>
                )}

                <p className="step-privacy">
                  {ui.privacyLinkPrefix}
                  <a
                    href={`${BASE_PATH}/privacy`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {ui.privacyLinkText}
                    <span className="sr-only"> {ui.newTabNote}</span>
                  </a>
                </p>

                <p className="step-safety">{form.safety}</p>
              </form>
            </m.div>
          </div>
        </section>
      </LazyMotion>
    </MotionConfig>
  );
}
