import React, { useEffect, useRef, useState } from "react";
import Footer from "../components/Footer";
import NET from "vanta/dist/vanta.net.min";
import * as THREE from "three";
import StakingCalculator from "../components/StakingCalculator";


export default function Home({ onConnect }) {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        NET({
          el: vantaRef.current,
          THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,

          // 🎨 COLORS (Grey / White Theme)
          color: 0xffffff,
          backgroundColor: 0x323131,

          // 🔮 SHAPE & MOTION
          points: 14.0,
          maxDistance: 12.0,
          spacing: 20.0,
          vertexColors: false,

          // 🧠 MOTION FEEL
          speed: 0.4,          // medium motion
          scale: 1.0,
          scaleMobile: 1.0,
        })
      );
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <div style={{ width: "100%", overflowX: "hidden" }}>
      {/* ================= HERO SECTION ================= */}
    <section
  style={{
    position: "relative",
    minHeight: "65vh",
    display: "flex",
    justifyContent: "center",
    textAlign: "center",
    padding: "60px 16px",
    overflow: "hidden",
  }}
>

{/* 🔮 VANTA BACKGROUND */}
<div
  ref={vantaRef}
  style={{
    position: "absolute",
    inset: 0,
    zIndex: 0,
  }}
/>

        {/* OVERLAY FOR READABILITY */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 1,
          }}
        />

       <div
  style={{
    position: "relative",
    zIndex: 2,
    maxWidth: 1100,
    width: "100%",
    margin: "0 auto",
  }}
>

          <h1
            style={{
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 900,
              marginBottom: 50,
              marginTop: 230,
              lineHeight: 1.1,
            }}
          >
            The BYTA Decentralized Growth Protocol
          </h1>

          <p
            style={{
              maxWidth: 900,
              fontSize: 18,
              lineHeight: 1.9,
              opacity: 0.9,
              marginBottom: 32,
            }}
          >
            A next-generation Web3 protocol designed for sustainable staking,
            long-term value creation, and decentralized income distribution.
          </p>

         
        </div>
      </section>


      {/* ================= WHAT IS BYTA ================= */}
      <section
        className="section"
        style={{
          marginTop: 20,             // ✅ KEY FIX: pull section closer to hero
        }}
      >
        <h2 className="section-title">What is BYTA?</h2>

        <p
          style={{
            maxWidth: 900,
            fontSize: 16,
            lineHeight: 1.8,
            opacity: 0.85,
          }}
        >
          BYTA is a decentralized staking and reward protocol that allows users
          to participate in ecosystem growth by staking tokens, locking value,
          and building teams — all powered entirely by smart contracts.
        </p>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="section">
        <h2 className="section-title">How BYTA Works</h2>

        <div className="grid-3">
          <div className="card">
            <h3>🔐 Stake BYTA</h3>
            <p>
              Stake your BYTA tokens securely using non-custodial smart
              contracts. You remain in full control of your assets.
            </p>
          </div>

          <div className="card">
            <h3>📈 Grow With the Network</h3>
            <p>
              Earn rewards through staking, long-term locks, and overall
              ecosystem expansion driven by real on-chain participation.
            </p>
          </div>

          <div className="card">
            <h3>📤 Claim & Manage</h3>
            <p>
              Track, claim, or manage your rewards directly from your dashboard
              with full transparency.
            </p>
          </div>
        </div>
      </section>

      {/* ================= ECOSYSTEM FEATURES ================= */}
      <section className="section">
        <h2 className="section-title">BYTA Ecosystem Features</h2>

        <div className="grid-4">
          <div className="card">💰 <b>Staking Rewards</b><br />Earn protocol rewards by participating in staking.</div>
          <div className="card">🔒 <b>Long-Term Locking</b><br />Increase reward potential with long-term commitment.</div>
          <div className="card">👥 <b>Team & Network Growth</b><br />Expand the ecosystem and unlock additional incentives.</div>
          <div className="card">📜 <b>Fully On-Chain</b><br />All logic executed transparently via smart contracts.</div>
        </div>
      </section>

{/* ================= STAKING CALCULATOR ================= */}
<section className="section">
  <h2 className="section-title">Staking Calculator</h2>

  <p
    style={{
      maxWidth: 700,
      fontSize: 15,
      lineHeight: 1.8,
      opacity: 0.85,
      marginBottom: 30,
      marginInline: "auto",
      textAlign: "center",
    }}
  >
    Estimate your staking rewards for normal and long-term staking before you
    commit your BYTA tokens.
  </p>

  <div style={{ maxWidth: 520, margin: "0 auto" }}>
    <StakingCalculator />
  </div>
</section>


      {/* ================= SECURITY ================= */}
     <section className="section">
  <h2 className="section-title">Security & Transparency</h2>

  <ul className="security-list security-fixed">
  <li>Non-custodial architecture</li>
  <li>Smart-contract based execution</li>
  <li>Verifiable on-chain transactions</li>
  <li>No centralized control over funds</li>
</ul>
</section>



      {/* ================= FINAL CTA ================= */}
      <section
        className="section"
        style={{
          textAlign: "center",
          marginBottom: 80,
        }}
      >
        <h2 className="section-title">Enter the BYTA Ecosystem</h2>

        <button
          onClick={onConnect}
          className="btn btn-primary"
          style={{
            padding: "16px 40px",
            fontSize: 16,
            borderRadius: 999,
          }}
        >
          Connect Wallet
        </button>

        <div style={{ marginTop: 12, fontSize: 13, opacity: 0.7 }}>
          Connect your wallet to access dashboard, staking and protocol features.
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <Footer />
    </div>
  );
}
