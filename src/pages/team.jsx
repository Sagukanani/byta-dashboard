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
          <div className="card">
            <strong>Left:</strong> {leftCount} &nbsp; | &nbsp;
            <strong>Right:</strong> {rightCount}
          </div>

          {team.length === 0 && <p>No direct team found.</p>}

          {team.length > 0 && (
            <div className="card">
              {team.map((m, i) => (
                <div key={i}>
                  {m.wallet} — {m.side}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
