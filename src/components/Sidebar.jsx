import React, { useState } from "react";

export default function Sidebar({ onClose, onNavigate, currentPage }) {
  const [buyOpen, setBuyOpen] = useState(false);

  const Btn = ({ children, onClick }) => (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        background:
          "linear-gradient(135deg, rgba(243, 237, 234, 0.94), rgba(8, 4, 0, 0.82))",
        color: "#750e0eef",
        padding: "12px 16px",
        borderRadius: 14,
        border: "1px solid rgba(247, 6, 6, 0.08)",
        fontWeight: 700,
        fontSize: 15,
        cursor: "pointer",
        marginBottom: 8,
        transition: "all .25s ease",
        boxShadow: "0 10px 25px rgba(69, 66, 66, 0.91)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow =
          "0 16px 40px rgba(77, 76, 76, 0.93)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 10px 25px rgba(77, 76, 76, 0.93)";
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
          "linear-gradient(180deg, #444343ff 0%, #4e4d4dff 100%)",
        color: "#ffff",
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
              "linear-gradient()",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "",
          }}
        >
          BYTA
        </div>

        <button
          onClick={onClose}
          style={{
            background: "rgba(6, 6, 5, 0.95)",
            color: "#fb0707ff",
            border: "1px solid rgba(6, 1, 0, 0.91)",
            borderRadius: 10,
            padding: "6px 10px",
            cursor: "pointer",
            fontSize: 22,
          }}
        >
          ×
        </button>
      </div>

      {/* NAVIGATION */}
     {/* NAVIGATION */}
<Btn
  onClick={() => {
    if (currentPage !== "dashboard") {
      onNavigate("dashboard");
    }
  }}
>
  📊 Dashboard
</Btn>

<Btn
  onClick={() => {
    if (currentPage !== "team") {
      onNavigate("team");
    }
  }}
>
  👥 My Team
</Btn>

<Btn
  onClick={() => {
    if (currentPage !== "stake") {
      onNavigate("stake");
    }
  }}
>
  🟡 Stake
</Btn>

{/* BUY / SELL */}
<div>
  <Btn onClick={() => setBuyOpen(!buyOpen)}>🔁 Buy / Sell</Btn>

  {buyOpen && (
    <div
      style={{
        marginLeft: 10,
        marginTop: 6,
        paddingLeft: 10,
        borderLeft: "2px solid rgba(245, 244, 247, 0.94)",
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



      <div style={{ flex: 1 }} />

      <div style={{ fontSize: 12, opacity: 0.6 }}>
        © {new Date().getFullYear()} BYTA
      </div>
    </div>
  );
}
