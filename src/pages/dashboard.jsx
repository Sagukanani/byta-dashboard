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
  getPendingRewardsToken
} from "../lib/web3";

/* ---------- HELPERS (UI ONLY) ---------- */
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

  const [stakingUsd, setStakingUsd] = useState("0");
  const [stakingByta, setStakingByta] = useState("0");

  const [bytaDailyUsd, setBytaDailyUsd] = useState("0");
  const [bytaDailyByta, setBytaDailyByta] = useState("0");

  const [totalRewardToken, setTotalRewardToken] = useState("0");
  const [totalRewardUsd, setTotalRewardUsd] = useState("0");

  const [referralIncome, setReferralIncome] = useState("0");

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
