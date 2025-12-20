import { useEffect, useState } from "react";
import { stakingContract } from "../lib/web3";

export default function Team({ address }) {
  const [loading, setLoading] = useState(true);
  const [leftTeam, setLeftTeam] = useState([]);
  const [rightTeam, setRightTeam] = useState([]);

  useEffect(() => {
    if (!address) return;

    let mounted = true;

    async function loadDirectTeam() {
      try {
        setLoading(true);

        const sc = stakingContract();
        const direct = await sc.getDirectReferrals(address);

        if (!mounted) return;

        const left = [];
        const right = [];

        for (const addr of direct) {
          const isLeft = await sc.sideIsLeft(addr);
          if (isLeft) left.push(addr);
          else right.push(addr);
        }

        setLeftTeam(left);
        setRightTeam(right);
      } catch (e) {
        console.error("Direct team load failed", e);
        if (mounted) {
          setLeftTeam([]);
          setRightTeam([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDirectTeam();
    return () => {
      mounted = false;
    };
  }, [address]);

  if (!address) {
    return (
      <div className="main-container">
        <h2>Please connect your wallet</h2>
      </div>
    );
  }

  return (
    <div className="main-container">
      <h1 className="header-title">My Team</h1>

      {/* YOUR WALLET */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="sub-value">
          <strong>Your Wallet:</strong> {address}
        </div>
      </div>

      {loading && <p>Loading team…</p>}

      {!loading && (
        <div className="stat-grid">

          {/* LEFT */}
          <div className="card">
            <h3>⬅️ Left Team ({leftTeam.length})</h3>
            {leftTeam.length === 0 && <p>No left referrals</p>}
            {leftTeam.map((addr, i) => (
              <div key={i} className="sub-value" style={{ marginTop: 6 }}>
                {addr}
              </div>
            ))}
          </div>

          {/* RIGHT */}
          <div className="card">
            <h3>➡️ Right Team ({rightTeam.length})</h3>
            {rightTeam.length === 0 && <p>No right referrals</p>}
            {rightTeam.map((addr, i) => (
              <div key={i} className="sub-value" style={{ marginTop: 6 }}>
                {addr}
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
