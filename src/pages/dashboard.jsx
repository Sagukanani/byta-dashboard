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

export default function Dashboard() {
  const [address, setAddress] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (!walletConnected || !address) return;
    load(address);
  }, [walletConnected, address]);

  async function load(user) {
  try {
    setLoading(true);

    // ⚡ PARALLEL CALLS (MAIN FIX)
    const [
      dashboard,
      bal,
      usdPrice,
      stakingUsdVal,
      bytaUsdVal,
      totalToken,
      ref
    ] = await Promise.all([
      getUserDashboardData(user),
      getTokenBalance(user),
      getTokenUsdValue("1"),
      getPendingStakingRewardUSD(user),
      getPendingBytaDailyUSD(user),
      getPendingRewardsToken(user),
      getReferralIncome(user)
    ]);

    setData(dashboard);
    setTokenBalance(bal);
    setTokenUsdValue(usdPrice);
    setReferralIncome(ref);

    setStakingUsd(stakingUsdVal);
    setBytaDailyUsd(bytaUsdVal);
    setTotalRewardToken(totalToken);

    const price = Number(usdPrice) || 0;

    setStakingByta(price ? stakingUsdVal / price : 0);
    setBytaDailyByta(price ? bytaUsdVal / price : 0);
    setTotalRewardUsd(Number(stakingUsdVal) + Number(bytaUsdVal));

    setTokenBalanceUsd(Number(bal) * price);
    setStakedUsd(Number(dashboard.stakedAmount) * price);

  } catch (err) {
    console.error("Dashboard load error:", err);
  } finally {
    setLoading(false);
  }
}

  async function handleClaim() {
    try {
      setClaimStatus("Claiming reward...");
      const sc = stakingContract();
      const tx = await sc.claim();
      await tx.wait();
      setClaimStatus("Reward claimed successfully");
      load(address);
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

  /* ---------- ONLY NEW UI (minimal) ---------- */
  if (!walletConnected) {
    return (
      <div className="main-container" style={{ textAlign: "center", marginTop: 100 }}>
        <button
          className="btn btn-primary"
          onClick={async () => {
            const user = await connectWallet();
            setAddress(user);
            setWalletConnected(true);
          }}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="main-container">Loading dashboard…</div>;
  }

  const baseUrl = window.location.origin;
  const leftRef = `${baseUrl}/?ref=${address}&side=left`;
  const rightRef = `${baseUrl}/?ref=${address}&side=right`;

  return (
    <div className="main-container">
      {/* ⬇️ BELOW THIS: 100% SAME UI, NOTHING TOUCHED */}
      <h1>Dashboard</h1>

      <Box title="Wallet">
        <span
          className="accent-blue"
          style={{ cursor: "pointer", wordBreak: "break-all" }}
          onClick={() => copyText(address)}
        >
          {shortText(address)}
        </span>
      </Box>

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
          <button className="btn btn-primary" onClick={handleClaim}>
            Claim Reward
          </button>
          {claimStatus && <div className="sub-value">{claimStatus}</div>}
        </Box>
      </div>

      {/* बाकी पूरा JSX SAME है */}
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
