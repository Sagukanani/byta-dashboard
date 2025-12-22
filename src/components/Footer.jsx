import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: 80,
        padding: "60px 40px 30px",
        background: "linear-gradient(180deg, #2e2e2e, #1f1f1f)",
        borderRadius: 20,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr 1fr",
          gap: 40,
        }}
      >
        {/* LEFT — ABOUT BYTA */}
        <div>
          <h2 style={{ marginBottom: 16 }}>BYTA</h2>
          <p style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.8 }}>
            BYTA is a decentralized Web3 protocol engineered for long-term
            value creation through staking, structured rewards, and
            ecosystem-driven growth.
            <br /><br />
            Built on transparent smart contracts, BYTA removes centralized
            control and enables users to participate directly in protocol
            economics while maintaining security and decentralization.
            <br /><br />
            BYTA represents the next phase of permissionless financial
            participation — where users grow with the protocol, not under it.
          </p>
        </div>

        {/* MIDDLE — NAVIGATION (SAME AS SIDEBAR) */}
        <div>
          <h3 style={{ marginBottom: 16 }}>Navigation</h3>
          <ul style={{ listStyle: "none", padding: 0, lineHeight: 2 }}>
            <li>Home</li>
            <li>Dashboard</li>
            <li>Stake</li>
            <li>Long Term Stake</li>
            <li>My Team</li>
            <li>Buy / Sell</li>
          </ul>
        </div>

        {/* RIGHT — FUTURE */}
        <div>
          <h3 style={{ marginBottom: 16 }}>More</h3>
          <p style={{ fontSize: 14, opacity: 0.7 }}>
            Additional ecosystem tools, governance utilities, and community
            features will be introduced in future protocol updates.
          </p>
        </div>
      </div>

      {/* BOTTOM LINE */}
      <div
        style={{
          marginTop: 40,
          paddingTop: 20,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          textAlign: "center",
          fontSize: 13,
          opacity: 0.7,
        }}
      >
        © 2025 BYTA Protocol. All rights reserved.  
        <br />
        Decentralized • Non-custodial • On-chain
      </div>
    </footer>
  );
}
