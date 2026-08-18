"use client";

import { LazyMotion, domAnimation, m, MotionConfig } from "framer-motion";
import { copy } from "@/lib/copy";
import BalancedText from "./BalancedText";

/**
 * סקשן האבחון: מסביר למה הכל נופל על בעל העסק,
 * מוריד את האשמה מהצוות וממנו, ומעביר את הבעיה לשיטה.
 * זה החלק שמכשיר את הקורא לקבל את ההצעה.
 */
const rise = (delay: number) => ({
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function Diagnosis() {
  const { diagnosis } = copy;

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <section className="diag">
          <div aria-hidden className="diag-glow" />
          <div className="diag-inner">
            <m.p {...rise(0)} className="diag-eyebrow">
              {diagnosis.eyebrow}
            </m.p>

            <m.h2 {...rise(0.06)} className="diag-h2">
              {diagnosis.h2line1}
              <br />
              <span className="diag-h2-accent">{diagnosis.h2line2}</span>
            </m.h2>

            <div className="diag-blocks">
              {diagnosis.blocks.map((b, i) => (
                <m.div key={b.hook} {...rise(0.1 + i * 0.06)} className="diag-block">
                  <h3 className="diag-hook">{b.hook}</h3>
                  <p className="diag-body">
                    <BalancedText text={b.body} />
                  </p>
                </m.div>
              ))}
            </div>

            <m.p {...rise(0.3)} className="diag-kicker">
              <BalancedText text={diagnosis.kicker} />
            </m.p>

          </div>
        </section>
      </LazyMotion>
    </MotionConfig>
  );
}
