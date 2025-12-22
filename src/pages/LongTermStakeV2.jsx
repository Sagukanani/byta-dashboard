import { useState, useEffect } from "react";
import { parseUnits, formatUnits } from "ethers";
import {
  getTokenBalance,
  tokenContract,
  stakingContract
} from "../lib/web3";

export default function LongTermStake({ address }) {
  const [amount, setAmount] = useState("");
  const [lockMonths, setLockMonths] = useState(1);
  const [balance, setBalance] = useState("0");

  const [allowance, setAllowance] = useState("0");
  const [approving, setApproving] = useState(false);
  const [staking, setStaking] = useState(false);
  const [approved, setApproved] = useState(false);
  const [status, setStatus] = useState("");

  const [locks, setLocks] = useState([]);
  const [loadingLocks, setLoadingLocks] = useState(false);
  const [, tick] = useState(0); // countdown refresh

  /* ---------------- INITIAL LOAD ---------------- */

  useEffect(() => {
    if (!address) return;

    async function load() {
      const bal = await getTokenBalance(address);
      setBalance(bal);

      const tc = tokenContract();
      const sc = stakingContract();
      const alw = await tc.allowance(address, sc.target);
      setAllowance(alw.toString());

      await loadLocks();
    }

    load();
  }, [address]);

  /* ---------------- COUNTDOWN TIMER ---------------- */

  useEffect(() => {
    const i = setInterval(() => tick(v => v + 1), 1000);
    return () => clearInterval(i);
  }, []);

  /* ---------------- APPROVAL CHECK ---------------- */

  useEffect(() => {
    if (!amount || Number(amount) <= 0) {
      setApproved(false);
      return;
    }
    try {
      const wei = parseUnits(amount, 18);
      setApproved(BigInt(allowance) >= wei);
    } catch {
      setApproved(false);
    }
  }, [amount, allowance]);

  /* ---------------- HELPERS ---------------- */

  const bonusMap = { 1: 2, 3: 4, 6: 6, 12: 8, 24: 10 };

  function handlePercentClick(p) {
    const bal = Number(balance);
    if (!bal) return;
    setAmount(p === 100 ? bal.toString() : ((bal * p) / 100).toFixed(6));
  }

  function formatTime(sec) {
    if (sec <= 0) return "Expired";
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  }

  /* ---------- ✅ ADD: PENDING LOCK REWARD CALCULATION ---------- */

function calcPendingLockReward(lock) {
  const now = Math.floor(Date.now() / 1000);

  if (!lock || !lock.lastClaim || now <= Number(lock.lastClaim)) {
    return "0.000000";
  }

  const rewardPeriod = 86400; // 1 day
  const rewardBP = 100; // 1% daily

  const elapsed = now - Number(lock.lastClaim);
  const periods = Math.floor(elapsed / rewardPeriod);
  if (periods <= 0) return "0.000000";

  const bonusBPMap = {
    1: 10200,
    3: 10400,
    6: 10600,
    12: 10800,
    24: 11000
  };

  const effectiveBP = bonusBPMap[Number(lock.lockMonths)] || 10000;

  // 🔒 BULLETPROOF BigInt normalization
  const amountBN =
    typeof lock.amount === "bigint"
      ? lock.amount
      : BigInt(lock.amount.toString());

  const rewardWei =
    (amountBN *
      BigInt(rewardBP) *
      BigInt(periods) *
      BigInt(effectiveBP)) /
    10000n /
    10000n;

  return formatUnits(rewardWei, 18);
}


  /* ---------------- LOAD LOCKS ---------------- */

  async function loadLocks() {
    try {
      setLoadingLocks(true);
      const sc = stakingContract();
      const data = await sc.getUserLocks(address);
      setLocks(data.filter(l => l.amount > 0n));
    } catch {
      setLocks([]);
    } finally {
      setLoadingLocks(false);
    }
  }

  /* ---------------- ACTIONS ---------------- */

  async function handleApprove() {
    try {
      setApproving(true);
      setStatus("Approving...");
      const tc = tokenContract();
      const sc = stakingContract();
      const wei = parseUnits(amount, 18);
      await (await tc.approve(sc.target, wei)).wait();
      const alw = await tc.allowance(address, sc.target);
      setAllowance(alw.toString());
      setStatus("Approve successful");
    } catch (e) {
      setStatus("Approve failed: " + e.message);
    } finally {
      setApproving(false);
    }
  }

  async function handleStakeLocked() {
    try {
      setStaking(true);
      setStatus("Lock staking...");
      const sc = stakingContract();
      const wei = parseUnits(amount, 18);
      await (await sc.stakeLockedV2(wei, lockMonths)).wait();
      setStatus("🎉 Lock staking successful");
      setAmount("");
      setBalance(await getTokenBalance(address));
      await loadLocks();
    } catch (e) {
      setStatus("Stake failed: " + e.message);
    } finally {
      setStaking(false);
    }
  }

  async function claimLock(i) {
    try {
      setStatus("Claiming reward...");
      const sc = stakingContract();
      await (await sc.claimLockedV2(i)).wait();
      setStatus("Reward claimed");
      await loadLocks();
    } catch (e) {
      setStatus("Claim failed: " + e.message);
    }
  }

  async function unstakeLock(i) {
    try {
      setStatus("Unstaking...");
      const sc = stakingContract();
      await (await sc.unstakeLockedV2(i)).wait();
      setStatus("Unstake successful");
      setBalance(await getTokenBalance(address));
      await loadLocks();
    } catch (e) {
      setStatus("Unstake failed: " + e.message);
    }
  }

  if (!address) {
    return <div className="main-container"><h2>Please connect your wallet</h2></div>;
  }

  return (
    <div className="main-container">
      <h1>🔒 Long Term Stake</h1>

      {/* BALANCE */}
      <div className="card section">
        <div className="label">Wallet Balance</div>
        <div className="value">{balance} BYTA</div>
      </div>

     {/* STAKE */}
<div className="card section">

  {/* ✅ VERTICAL STACK — यही spacing fix करेगा */}
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 14   // 👈 यहीं से spacing control होगी
    }}
  >

    {/* % BUTTONS */}
    <div style={{ display: "flex", gap: 8 }}>
      {[25, 50, 75].map(p => (
        <button
          key={p}
          className="btn btn-secondary"
          onClick={() => handlePercentClick(p)}
          style={{
            padding: "6px 10px",
            fontSize: 13,
            minWidth: 50,
            borderRadius: 8
          }}
        >
          {p}%
        </button>
      ))}

      <button
        className="btn btn-secondary"
        onClick={() => handlePercentClick(100)}
        style={{
          padding: "6px 10px",
          fontSize: 13,
          minWidth: 50,
          borderRadius: 8
        }}
      >
        MAX
      </button>
    </div>

    {/* AMOUNT */}
    <div>
      <div className="label">Amount</div>
      <input
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
    </div>

    {/* LOCK PERIOD */}
    <div>
      <div className="label">Lock Period</div>
      <select
        value={lockMonths}
        onChange={e => setLockMonths(Number(e.target.value))}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 10,
          background: "#111",
          color: "#fff",
          border: "1px solid #333",
          fontSize: 15
        }}
      >
        {[1, 3, 6, 12, 24].map(m => (
          <option key={m} value={m}>
            {m} Month (+{bonusMap[m]}%)
          </option>
        ))}
      </select>
    </div>

    {/* ACTION BUTTON */}
    {!approved ? (
      <button
        className="btn btn-secondary"
        onClick={handleApprove}
        disabled={!amount || approving}
      >
        {approving ? "Approving..." : "Approve"}
      </button>
    ) : (
      <button
        className="btn btn-primary"
        onClick={handleStakeLocked}
        disabled={staking}
      >
        {staking ? "Staking..." : "🔒 Lock & Stake"}
      </button>
    )}

    {status && <div className="sub-value">{status}</div>}
  </div>
</div>


      {/* LOCKED STAKES */}
      <div className="card section">
        <h2>🔐 My Locked Stakes</h2>

        {loadingLocks && <div>Loading locks...</div>}
        {!loadingLocks && locks.length === 0 && <div>No active locks</div>}

        {locks.map((l, i) => {
          const now = Math.floor(Date.now() / 1000);
          const remaining = Number(l.end) - now;
          const expired = remaining <= 0;
          const pendingReward = calcPendingLockReward(l); // ✅ ADD

          return (
            <div key={i} style={{ border: "1px solid #333", borderRadius: 10, padding: 12, marginTop: 10 }}>
              <div><b>Amount:</b> {formatUnits(l.amount, 18)} BYTA</div>
              <div><b>Lock:</b> {l.lockMonths} months</div>
              <div><b>Status:</b> {expired ? "Expired" : "Active"}</div>
              <div><b>Time left:</b> {formatTime(remaining)}</div>
              <div><b>Auto renew:</b> {l.autoRenewCount}</div>

              {/* ✅ ADD: Pending Reward */}
              <div>
                <b>Pending Reward:</b>{" "}
                <span style={{ color: "#f5a623" }}>
                  {pendingReward} BYTA
                </span>
              </div>

              {!expired && <div style={{ fontSize: 12, opacity: 0.6 }}>Claim anytime</div>}
              {expired && <div style={{ fontSize: 12, opacity: 0.6 }}>Unstake within grace period</div>}

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="btn btn-secondary" onClick={() => claimLock(i)}>Claim</button>
                {expired && (
                  <button className="btn btn-primary" onClick={() => unstakeLock(i)}>Unstake</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
