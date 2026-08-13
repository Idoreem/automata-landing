"use client";

import { useEffect, useState } from "react";
import { copy } from "@/lib/copy";

/**
 * כפתור CTA צף למובייל בלבד:
 * מופיע אחרי שגוללים מעבר להירו, נעלם כשהטופס נכנס למסך.
 */
export default function StickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const form = document.getElementById("form");
    let pastHero = false;
    let formVisible = false;

    const update = () => setShow(pastHero && !formVisible);

    const onScroll = () => {
      pastHero = window.scrollY > window.innerHeight * 0.75;
      update();
    };

    const io = form
      ? new IntersectionObserver(
          (entries) => {
            formVisible = entries[0].isIntersecting;
            update();
          },
          { threshold: 0.12 }
        )
      : null;

    if (form && io) io.observe(form);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, []);

  return (
    <div className={`sticky-cta${show ? " on" : ""}`} aria-hidden={!show}>
      <a href="#form" className="cta-btn" tabIndex={show ? 0 : -1}>
        {copy.hero.cta}
      </a>
    </div>
  );
}
