import { useEffect, useState } from "react";
import { connectWallet, getMyDirectTeam } from "../lib/web3";

export default function Team() {
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState([]);
  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const addr = await connectWallet();
      const res = await getMyDirectTeam(addr);

      setTeam(res.team || []);
      setLeftCount(res.leftCount || 0);
      setRightCount(res.rightCount || 0);
    } catch (e) {
      console.error("TEAM LOAD ERROR:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="main-container">
      <h1 className="header-title">My Team</h1>

      {loading && <p>Loading team…</p>}

      {!loading && (
        <>
          {/* SUMMARY */}
          <div className="card">
            <strong>Left:</strong> {leftCount} &nbsp; | &nbsp;
            <strong>Right:</strong> {rightCount}
          </div>

          {/* NO TEAM */}
          {team.length === 0 && <p>No direct team found.</p>}

          {/* TEAM LIST */}
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
                    <strong>Wallet:</strong> {m.wallet}
                  </div>

                  <div style={{ fontSize: 13, opacity: 0.7 }}>
                    Side: <strong>{m.side}</strong> &nbsp; | &nbsp;
                    Indirect Team: <strong>{m.indirectCount ?? 0}</strong>
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
