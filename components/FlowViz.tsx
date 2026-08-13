/**
 * ויזואל "זרימת אוטומציה" — קווים מקווקווים שזורמים בין צמתים זוהרים.
 * CSS בלבד, מכבד prefers-reduced-motion, בלי JS.
 * משמש כרקע חי לסלוטים השמורים למדיה עד שהתוכן האמיתי נכנס.
 */
export default function FlowViz() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 250"
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0.55,
      }}
    >
      <defs>
        <radialGradient id="fv-node" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8ab4ff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#2f6bff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* קווי הזרימה */}
      <path
        className="flow-line"
        d="M 55 195 C 110 150, 150 110, 200 78"
        fill="none"
        stroke="rgba(77, 141, 255, 0.5)"
        strokeWidth="1.5"
      />
      <path
        className="flow-line"
        d="M 200 78 C 255 105, 300 140, 345 172"
        fill="none"
        stroke="rgba(77, 141, 255, 0.5)"
        strokeWidth="1.5"
        style={{ animationDelay: "0.8s" }}
      />
      <path
        className="flow-line"
        d="M 55 195 C 150 215, 260 210, 345 172"
        fill="none"
        stroke="rgba(77, 141, 255, 0.3)"
        strokeWidth="1.2"
        style={{ animationDelay: "1.6s" }}
      />

      {/* הצמתים */}
      <g className="flow-node">
        <circle cx="55" cy="195" r="16" fill="url(#fv-node)" />
        <circle cx="55" cy="195" r="4" fill="#8ab4ff" />
      </g>
      <g className="flow-node" style={{ animationDelay: "1s" }}>
        <circle cx="200" cy="78" r="20" fill="url(#fv-node)" />
        <circle cx="200" cy="78" r="4.5" fill="#8ab4ff" />
      </g>
      <g className="flow-node" style={{ animationDelay: "2s" }}>
        <circle cx="345" cy="172" r="16" fill="url(#fv-node)" />
        <circle cx="345" cy="172" r="4" fill="#8ab4ff" />
      </g>
    </svg>
  );
}
