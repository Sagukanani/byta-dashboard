import { useEffect, useState } from "react";
import { connectWallet, getMyFullTeam } from "../lib/web3";

export default function Team() {
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState([]);
  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const addr = await connectWallet();
        if (!mounted) return;

        setAccount(addr);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!account) return;

    let mounted = true;

    async function loadTeam() {
      setLoading(true);
      const res = await getMyFullTeam(account);
      if (!mounted) return;

      setTeam(res.team);
      setLeftCount(res.leftCount);
      setRightCount(res.rightCount);
      setLoading(false);
    }

    loadTeam();

    return () => {
      mounted = false;
    };
  }, [account]);

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
                    <strong>Wallet:</strong> {m.wallet}
                  </div>

                  <div style={{ fontSize: 13, opacity: 0.7 }}>
                    Side: <strong>{m.side}</strong> &nbsp; | &nbsp;
                    Total Team: <strong>{m.totalCount}</strong>
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
