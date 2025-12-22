import React, { useEffect, useState } from "react";
import {
  connectWallet,
  getUserDashboardData,
  getTokenBalance,
  getTokenUsdValue,
  stakingContract,
  getReferralIncome,
  getPendingStakingRewardUSD,
  getPendingBytaDailyUSD,
  getPendingRewardsToken,
  getLockedSummary,
} from "../lib/web3";

/* ---------- HELPERS (UI ONLY) ---------- */
function formatTimeLeft(seconds) {
  if (seconds <= 0) return "Expired";

  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  return `${d}d ${h}h ${m}m`;
}

function formatNumber(n, d = 2) {
  const num = Number(n);
  if (!num || isNaN(num)) return "0";

  if (num >= 1e9) return (num / 1e9).toFixed(d) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(d) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(d) + "K";

  return num.toFixed(d);
}

function shortText(text) {
  if (!text) return "";
  return text.slice(0, 6) + "..." + text.slice(-4);
}

function copyText(text) {
  navigator.clipboard.writeText(text);
}

export default function Dashboard({ address }) {
  const [loading, setLoading] = useState(true);
  const [claimStatus, setClaimStatus] = useState("");

  const [data, setData] = useState({
    stakedAmount: "0",
    left: "0",
    right: "0",
    tier: 0,
  });

  const [tokenBalance, setTokenBalance] = useState("0");
  const [tokenUsdValue, setTokenUsdValue] = useState("0");
  const [tokenBalanceUsd, setTokenBalanceUsd] = useState("0");
  const [stakedUsd, setStakedUsd] = useState("0");
  
  
const [locks, setLocks] = useState([]);


  const [stakingUsd, setStakingUsd] = useState("0");
  const [stakingByta, setStakingByta] = useState("0");

  const [bytaDailyUsd, setBytaDailyUsd] = useState("0");
  const [bytaDailyByta, setBytaDailyByta] = useState("0");

  const [totalRewardToken, setTotalRewardToken] = useState("0");
  const [totalRewardUsd, setTotalRewardUsd] = useState("0");

  const [referralIncome, setReferralIncome] = useState("0");

  const [selectedLockIndex, setSelectedLockIndex] = useState(0);
  const [selectedLock, setSelectedLock] = useState(null);

    const [lockedSummary, setLockedSummary] = useState({
    totalLocked: "0",
    activeLocks: 0,
    pendingReward: "0",
  });

 

  // 🔴 MAIN LOAD FUNCTION (UNCHANGED)
  async function load() {
    try {
      setLoading(true);

      const user = address;


      const dashboard = await getUserDashboardData(user);
      setData(dashboard);

      const bal = await getTokenBalance(user);
      setTokenBalance(bal);

      const usdPrice = await getTokenUsdValue("1");
      setTokenUsdValue(usdPrice);

      const ref = await getReferralIncome(user);
      setReferralIncome(ref);

      const lockSummary = await getLockedSummary(user);
      setLockedSummary(lockSummary);

      // 👇 fetch actual lock details
const sc = stakingContract();
const userLocks = await sc.getUserLocks(user);
setLocks(userLocks.filter(l => l.amount > 0n));

// set default selected lock
if (userLocks.length > 0) {
  setSelectedLock(userLocks[selectedLockIndex] || userLocks[0]);
}


// 👇 NEW: selected lock data
if (lockSummary.locks && lockSummary.locks.length > 0) {
  setSelectedLock(lockSummary.locks[selectedLockIndex] || lockSummary.locks[0]);
}

      const stakingUsdVal = await getPendingStakingRewardUSD(user);
      const bytaUsdVal = await getPendingBytaDailyUSD(user);
      const totalToken = await getPendingRewardsToken(user);

      setStakingUsd(stakingUsdVal);
      setBytaDailyUsd(bytaUsdVal);
      setTotalRewardToken(totalToken);

      const price = Number(usdPrice);

      setStakingByta(price > 0 ? stakingUsdVal / price : 0);
      setBytaDailyByta(price > 0 ? bytaUsdVal / price : 0);
      setTotalRewardUsd(Number(stakingUsdVal) + Number(bytaUsdVal));

      setTokenBalanceUsd(Number(bal) * price);
      setStakedUsd(Number(dashboard.stakedAmount) * price);

      // 🔒 LOCKED SUMMARY (NEW)
      const lockData = await getLockedSummary(user);
      setLockedSummary(lockData);

    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }

    // ✅ AUTO LOAD DASHBOARD WHEN ADDRESS IS AVAILABLE
  useEffect(() => {
    if (address) {
      load();
    }
  }, [address]);
 
  useEffect(() => {
  if (locks.length > 0) {
    setSelectedLock(locks[selectedLockIndex]);
  }
}, [selectedLockIndex, locks]);

  // 🔥 LISTEN FOR CONNECT BUTTON FROM App.jsx
 

  async function handleClaim() {
  try {
    setClaimStatus("Claiming reward...");
    const sc = stakingContract();
    const tx = await sc.claim();
    await tx.wait();

    setClaimStatus("Reward claimed");

    // 🔹 only update affected values
    const user = address;

    setTokenBalance(await getTokenBalance(user));

    const stakingUsdVal = await getPendingStakingRewardUSD(user);
    const bytaUsdVal = await getPendingBytaDailyUSD(user);
    const totalToken = await getPendingRewardsToken(user);

    setStakingUsd(stakingUsdVal);
    setBytaDailyUsd(bytaUsdVal);
    setTotalRewardToken(totalToken);

  } catch (err) {
    setClaimStatus("Claim failed: " + err.message);
  }
}
// 🔒 CLAIM SELECTED LOCK REWARD
async function handleClaimLockReward() {
  if (!selectedLock) return;

  try {
    setClaimStatus("Claiming lock reward...");

    const sc = stakingContract();
    const tx = await sc.claimLockedV2(selectedLockIndex);
    await tx.wait();

    setClaimStatus("Lock reward claimed 🎉");

    // 🔄 refresh dashboard
    await load();

  } catch (err) {
    setClaimStatus("Lock claim failed: " + err.message);
  }
}


  const TIER_NAMES = {
    0: "No Tier",
    1: "BYTA-1",
    2: "BYTA-2",
    3: "BYTA-3",
    4: "BYTA-4",
    5: "BYTA-5",
    6: "BYTA-6",
    7: "BYTA-7",
  };

  if (loading && address) {
    return <div className="main-container">Loading dashboard…</div>;
  }

  const baseUrl = window.location.origin;
  const leftRef = `${baseUrl}/?ref=${address}&side=left`;
  const rightRef = `${baseUrl}/?ref=${address}&side=right`;

if (!address) {
  return (
    <div className="main-container">
      <h2>Please connect your wallet</h2>
    </div>
  );
}

  return (
    <div className="main-container">
      <h1>Dashboard</h1>

      

      {/* TOP GRID */}
      <div className="stat-grid section">
        <Box title="Token Balance">
          <div className="value accent-purple">
            {formatNumber(tokenBalance)} BYTA
          </div>
          <div className="sub-value">
            ≈ ${formatNumber(tokenBalanceUsd)} USD
          </div>
        </Box>

        <Box title="Staked Amount">

  {/* STAKED AMOUNT (ALWAYS SAME) */}
  <div className="value accent-green">
    {formatNumber(data.stakedAmount)} BYTA
  </div>

  <div className="sub-value">
    ≈ ${formatNumber(stakedUsd)} USD
  </div>

 

</Box>





        <Box title="Your Tier">
          <div className="value">{TIER_NAMES[data.tier]}</div>
        </Box>

        <Box title="Claim Rewards">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleClaim}
         >
            Claim Reward
         </button>

          {claimStatus && <div className="sub-value">{claimStatus}</div>}
        </Box>
      </div>

      {/* REWARDS */}
      <div className="stat-grid section">
        <Box title="Pending Staking Reward">
          <div className="value">{formatNumber(stakingUsd)} USD</div>
          <div className="sub-value">
            ≈ {formatNumber(stakingByta, 6)} BYTA
          </div>
        </Box>

        <Box title="BYTA Daily Income">
          <div className="value">{formatNumber(bytaDailyUsd)} USD</div>
          <div className="sub-value">
            ≈ {formatNumber(bytaDailyByta, 6)} BYTA
          </div>
        </Box>

        <Box title="Total Claimable Reward">
          <div className="value accent-purple">
            {formatNumber(totalRewardToken, 6)} BYTA
          </div>
          <div className="sub-value">
            ≈ ${formatNumber(totalRewardUsd)} USD
          </div>
        </Box>

        <Box title="Referral Income">
          <div className="value">{formatNumber(referralIncome)} BYTA</div>
        </Box>
      </div>

     {/* 🔒 LOCKED SUMMARY */}
<div className="stat-grid section">
 <Box title="🔒 Locked Summary">
  {/* 🔲 TWO COLUMN LAYOUT */}
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: 20,
      alignItems: "flex-start"
    }}
  >
    {/* ⬅️ LEFT SIDE */}
    <div>
      <div className="value accent-green">
        {formatNumber(lockedSummary.totalLocked)} BYTA
      </div>

      {/* ACTIVE LOCKS */}
      <div style={{ marginTop: 6 }}>
        <b>Active Locks:</b>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          {Array.from({ length: lockedSummary.activeLocks }).map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedLockIndex(i)}
              className="btn btn-secondary"
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                background:
                  selectedLockIndex === i ? "#e62806f0" : "#070404ff",
                color: "#fff",
                border: "1px solid #333",
                fontSize: 13
              }}
            >
              Lock {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>

   {/* ➡️ RIGHT SIDE (ACTION AREA) */}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 10,
    minWidth: 240
  }}
>
  <button
    className="btn btn-primary"
    style={{
      padding: "12px 20px",
      borderRadius: 12,
      fontWeight: 600
    }}
    disabled={
      !selectedLock ||
      Number(lockedSummary.pendingReward) === 0
    }
    onClick={handleClaimLockReward}
  >
    🔓 Claim Lock Reward
  </button>

  {/* ✅ PENDING LOCK REWARD — JUST BELOW BUTTON */}
  <div
    style={{
      fontSize: 13,
      color: "#aaaaaaff",
      textAlign: "right"
    }}
  >
    Pending Lock Reward:{" "}
    <span style={{ color: "#ff3b3b", fontWeight: 600 }}>
      {formatNumber(lockedSummary.pendingReward, 6)} BYTA
    </span>
  </div>
</div>
  </div>
  {/* 🔍 SELECTED LOCK DETAILS (FULL WIDTH BELOW) */}
  {selectedLock && (
  <div
    style={{
      marginTop: 12,
      padding: 12,
      borderRadius: 10,
      background: "#070404ff",
      border: "1px solid #333",
      fontSize: 13
    }}
  >
    <div><b>Selected Lock:</b> #{selectedLockIndex + 1}</div>

    <div>
      <b>Amount:</b>{" "}
      {(Number(selectedLock.amount) / 1e18).toFixed(6)} BYTA
    </div>

    <div>
      <b>Lock Period:</b> {selectedLock.lockMonths} months
    </div>

    <div>
      <b>Auto Renew:</b>{" "}
      {selectedLock.autoRenewCount > 0 ? "Yes" : "No"}
    </div>

    {/* ⏳ COUNTDOWN TIMER */}
    <div style={{ marginTop: 6 }}>
      <b>Time Left:</b>{" "}
      <span style={{ color: "#f5a623" }}>
        {formatTimeLeft(
  Number(selectedLock.end) - Math.floor(Date.now() / 1000)
)}
      </span>
    </div>
  </div>
)}

</Box>

</div>


      {/* REFERRAL LINKS */}
      <div className="section">
        <h2>Referral Links</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Box title="Left Side">
            <div
              className="sub-value"
              style={{ cursor: "pointer", wordBreak: "break-all" }}
              onClick={() => copyText(leftRef)}
            >
              {shortText(leftRef)}
            </div>
            <button className="btn btn-copy" onClick={() => copyText(leftRef)}>
              Copy
            </button>
          </Box>

          <Box title="Right Side">
            <div
              className="sub-value"
              style={{ cursor: "pointer", wordBreak: "break-all" }}
              onClick={() => copyText(rightRef)}
            >
              {shortText(rightRef)}
            </div>
            <button className="btn btn-copy" onClick={() => copyText(rightRef)}>
              Copy
            </button>
          </Box>
        </div>
      </div>

      {/* TEAM VOLUME */}
      <div className="section">
        <h2>Team Volume</h2>
        <div className="stat-grid">
          <Box title="Left">
            <div className="value">{formatNumber(data.left)} USD</div>
          </Box>
          <Box title="Right">
            <div className="value">{formatNumber(data.right)} USD</div>
          </Box>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI COMPONENT ---------- */
function Box({ title, children }) {
  return (
    <div className="card">
      <div className="label">{title}</div>
      {children}
    </div>
  );
}
