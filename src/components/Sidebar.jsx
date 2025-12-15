import React, { useState } from "react";

export default function Sidebar({ onClose, onNavigate }) {
  const [buyOpen, setBuyOpen] = useState(false);

  const Btn = ({ children, onClick }) => (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        background:
          "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(91,33,182,0.15))",
        color: "#ffffff",
        padding: "12px 16px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        fontWeight: 700,
        fontSize: 15,
        cursor: "pointer",
        marginBottom: 8,
        transition: "all .25s ease",
        boxShadow: "0 10px 25px rgba(2,6,23,0.6)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow =
          "0 16px 40px rgba(124,58,237,0.45)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 10px 25px rgba(2,6,23,0.6)";
      }}
    >
      {children}
    </button>
  );

  return (
    <div
      style={{
        height: "100%",
        padding: 22,
        background:
          "linear-gradient(180deg, #050b1d 0%, #0a1430 100%)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxSizing: "border-box",
      }}
    >
      {/* TOP HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div
          style={{
            fontSize: 24,
            fontWeight: 900,
            background:
              "linear-gradient(90deg,#7c3aed,#5b21b6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          BYTA
        </div>

        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            padding: "6px 10px",
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          ×
        </button>
      </div>

      {/* NAVIGATION */}
      <Btn onClick={() => onNavigate("dashboard")}>📊 Dashboard</Btn>
      <Btn onClick={() => onNavigate("team")}>👥 My Team</Btn>

      {/* BUY / SELL */}
      <div>
        <Btn onClick={() => setBuyOpen(!buyOpen)}>🔁 Buy / Sell</Btn>

        {buyOpen && (
          <div
            style={{
              marginLeft: 10,
              marginTop: 6,
              paddingLeft: 10,
              borderLeft: "2px solid rgba(124,58,237,0.4)",
            }}
          >
            <a
              href="https://pancakeswap.finance/swap?chain=bsc&outputCurrency=0x6C92453d460ea7d3745DB3e1D276083910Ce6713"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "block",
                fontSize: 14,
                color: "#d1d5db",
                marginBottom: 6,
                textDecoration: "none",
              }}
            >
              Buy (PancakeSwap)
            </a>

            <a
              href="https://pancakeswap.finance/swap?chain=bsc&inputCurrency=0x6C92453d460ea7d3745DB3e1D276083910Ce6713"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "block",
                fontSize: 14,
                color: "#d1d5db",
                textDecoration: "none",
              }}
            >
              Sell (PancakeSwap)
            </a>
          </div>
        )}
      </div>

      <Btn onClick={() => onNavigate("stake")}>🟡 Stake</Btn>

      <div style={{ flex: 1 }} />

      <div style={{ fontSize: 12, opacity: 0.6 }}>
        © {new Date().getFullYear()} BYTA
      </div>
    </div>
  );
}
