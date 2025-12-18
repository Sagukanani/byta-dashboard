import { useEffect, useState } from "react";
import { connectWallet } from "../lib/web3";

// ✅ env first, fallback second
const INDEXER_API =
  import.meta.env.VITE_INDEXER_API ||
  "https://byta-indexer-api.onrender.com";

export default function Team() {
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState([]);
  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);
  const [totalTeam, setTotalTeam] = useState(0);
  const [account, setAccount] = useState(null);

  /* ---------------- CONNECT WALLET ---------------- */

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const addr = await connectWallet();
        if (!mounted) return;
        setAccount(addr.toLowerCase()); // ✅ normalize once
      } catch (e) {
        console.error("Wallet connect failed", e);
        if (mounted) setLoading(false);
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, []);

  /* ---------------- LOAD TEAM FROM INDEXER ---------------- */

  useEffect(() => {
    if (!account) return;

    let mounted = true;

    async function loadTeam() {
      try {
        setLoading(true);

        const res = await fetch(`${INDEXER_API}/team/${account}`);

        if (!res.ok) {
          throw new Error("Indexer API error");
        }

        const data = await res.json();
        if (!mounted) return;

        setTeam(data.team ?? []);
        setLeftCount(data.leftCount ?? 0);
        setRightCount(data.rightCount ?? 0);
        setTotalTeam(data.totalTeam ?? 0);
      } catch (e) {
        console.error("Team load failed", e);
        if (mounted) {
          setTeam([]);
          setLeftCount(0);
          setRightCount(0);
          setTotalTeam(0);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadTeam();
    return () => {
      mounted = false;
    };
  }, [account]);

  /* ---------------- UI ---------------- */

  return (
    <div className="main-container">
      <h1 className="header-title">My Team</h1>

      {loading && <p>Loading team…</p>}

      {!loading && (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <strong>Total Team:</strong> {totalTeam} <br />
            <strong>Left:</strong> {leftCount} &nbsp; | &nbsp;
            <strong>Right:</strong> {rightCount}
          </div>

          {team.length === 0 && <p>No team found.</p>}

          {team.length > 0 && (
            <div className="card">
              {team.map((m, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.08)"
                  }}
                >
                  <div className="sub-value">
                    <strong>Wallet:</strong> {m.address}
                  </div>

                  <div style={{ fontSize: 13, opacity: 0.7 }}>
                    Level: <strong>{m.level}</strong> &nbsp; | &nbsp;
                    Side: <strong>{m.side}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
