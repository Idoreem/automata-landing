import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        textAlign: "center",
        padding: 24,
        background: "var(--bg)",
      }}
    >
      <p
        style={{
          fontSize: "clamp(3rem, 10vw, 5rem)",
          fontWeight: 800,
          margin: 0,
          background: "linear-gradient(135deg, #2f6bff 0%, #8ab4ff 50%, #2f6bff 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        404
      </p>
      <p style={{ color: "#aab4c8", fontSize: "1.1rem", margin: 0 }}>
        הדף הזה לא קיים. הדף שכן קיים - שווה את הקליק.
      </p>
      <Link
        href="/"
        className="cta-btn"
        style={{ fontSize: "1.05rem", padding: "14px 36px", marginTop: 10 }}
      >
        לדף הראשי
      </Link>
    </main>
  );
}
