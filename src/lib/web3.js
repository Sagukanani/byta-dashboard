import {
  BrowserProvider,
  JsonRpcProvider,
  Contract,
  formatUnits,
  formatEther,
  parseEther
} from "ethers";

import {
  TOKEN_ADDRESS,
  STAKING_ADDRESS,
  TOKEN_ABI,
  STAKING_ABI
} from "./abis";

let provider;
let signer;

/* ---------------- CONNECT WALLET ---------------- */

export async function connectWallet() {
  if (!window.ethereum) throw new Error("MetaMask not found");

  await window.ethereum.request({ method: "eth_requestAccounts" });
  provider = new BrowserProvider(window.ethereum);
  signer = await provider.getSigner();

  return signer.address;
}

/* ---------------- CONTRACT HELPERS ---------------- */

export function tokenContract() {
  return new Contract(TOKEN_ADDRESS, TOKEN_ABI, signer || provider);
}

export function stakingContract() {
  return new Contract(STAKING_ADDRESS, STAKING_ABI, signer || provider);
}

/* ---------------- DASHBOARD DATA ---------------- */

export async function getUserDashboardData(user) {
  const sc = stakingContract();

  const stakeInfo = await sc.stakes(user);
  const leftVol = await sc.leftVolumeUSD(user);
  const rightVol = await sc.rightVolumeUSD(user);
  const tier = await sc.bytaTier(user);

  return {
    stakedAmount: formatEther(stakeInfo.amount),
    left: formatEther(leftVol),
    right: formatEther(rightVol),
    tier: Number(tier)
  };
}

/* ---------------- TOKEN BALANCE ---------------- */

export async function getTokenBalance(user) {
  const balWei = await tokenContract().balanceOf(user);
  return formatEther(balWei);
}

/* ---------------- TOKEN → USD ---------------- */

export async function getTokenUsdValue(tokenAmountHuman) {
  if (!tokenAmountHuman || Number(tokenAmountHuman) === 0) return "0.00";

  const tc = tokenContract();
  const tokenWei = parseEther(tokenAmountHuman.toString());
  const usdWei = await tc.toUSD(tokenWei);

  return Number(formatEther(usdWei)).toFixed(2);
}

/* ---------------- CLAIM REWARD ---------------- */

export async function claimReward() {
  const sc = stakingContract();
  const tx = await sc.claim();
  await tx.wait();
  return tx.hash;
}

/* ---------------- CLAIM HISTORY ---------------- */

export async function getClaimHistory(user) {
  const sc = stakingContract();
  const provider = sc.runner.provider;

  const latest = await provider.getBlockNumber();
  const START = Math.max(latest - 20000, 0);
  const CHUNK = 800;

  const filter = sc.filters.RewardPaid(user);

  let logs = [];

  for (let from = START; from <= latest; from += CHUNK) {
    const to = Math.min(from + CHUNK - 1, latest);
    try {
      const part = await sc.queryFilter(filter, from, to);
      logs.push(...part);
    } catch {
      // skip
    }
  }

  return logs
    .sort((a, b) => b.blockNumber - a.blockNumber)
    .slice(0, 20)
    .map(log => ({
      amount: formatUnits(log.args.tokenAmount, 18),
      usd: formatUnits(log.args.usdAmount, 18),
      txHash: log.transactionHash,
      type: "Staking Reward"
    }));
}

/* ---------------- PENDING STAKING REWARD ---------------- */

export async function getStakingPendingReward(user) {
  const sc = stakingContract();

  const stake = await sc.stakes(user);
  if (stake.amount === 0n) return "0";

  const rewardBP = await sc.rewardPerPeriodBP();
  const rewardPeriod = await sc.rewardPeriod();

  const lastClaim = Number(stake.lastClaim);
  if (lastClaim === 0) return "0";

  const now = Math.floor(Date.now() / 1000);
  const elapsed = now - lastClaim;
  if (elapsed < rewardPeriod) return "0";

  const periods = Math.floor(elapsed / Number(rewardPeriod));

  const rewardWei =
    (stake.amount * BigInt(rewardBP) * BigInt(periods)) / 10000n;

  return formatEther(rewardWei);
}

/* ---------------- REFERRAL INCOME ---------------- */

export async function getReferralIncome(user) {
  const sc = stakingContract();
  const provider = sc.runner.provider;

  const latest = await provider.getBlockNumber();
  const START = Math.max(latest - 20000, 0);
  const CHUNK = 800;

  const filter = sc.filters.ReferralPaid(user);

  let total = 0n;

  for (let from = START; from <= latest; from += CHUNK) {
    const to = Math.min(from + CHUNK - 1, latest);
    try {
      const logs = await sc.queryFilter(filter, from, to);
      for (const log of logs) {
        total += log.args.tokenAmount;
      }
    } catch {
      // skip
    }
  }

  return formatEther(total);
}


/* ---------------- PENDING REWARDS (USD) ---------------- */

export async function getPendingStakingRewardUSD(user) {
  const sc = stakingContract();
  const usdWei = await sc.pendingStakingRewardUSD(user);
  return formatEther(usdWei);
}

export async function getPendingBytaDailyUSD(user) {
  const sc = stakingContract();
  const usdWei = await sc.pendingBytaDailyUSD(user);
  return formatEther(usdWei);
}

export async function getPendingRewardsToken(user) {
  const tc = tokenContract();

  const stakingUsd = await getPendingStakingRewardUSD(user);
  const bytaUsd = await getPendingBytaDailyUSD(user);

  const totalUsd = Number(stakingUsd) + Number(bytaUsd);
  if (totalUsd === 0) return "0";

  const tokenWei = await tc.toToken(parseEther(totalUsd.toString()));
  return formatEther(tokenWei);
}
/* ---------------- DIRECT TEAM (ON-CHAIN) ---------------- */

// ✅ DIRECT referrals only (level 1)
export async function getDirectTeam(user) {
  const sc = stakingContract();

  // call contract view
  const addresses = await sc.getDirectReferrals(user);

  // frontend-friendly format
  return addresses.map(addr => ({
    address: addr,
    level: 1,
    side: "direct"
  }));
}

/* =========================================================
   LOCKED SUMMARY (FOR DASHBOARD)
   ========================================================= */

export async function getLockedSummary(address) {
  const sc = stakingContract();

  const [totalLocked, activeLocks, locks] = await Promise.all([
    sc.getUserTotalLocked(address),
    sc.getUserActiveLocks(address),
    sc.getUserLocks(address)
  ]);

  let pendingRewardWei = 0n;
  const now = BigInt(Math.floor(Date.now() / 1000));

  for (const l of locks) {
    if (l.amount === 0n) continue;
    if (l.lastClaim === 0n || now <= l.lastClaim) continue;

    const rewardPeriod = 86400n; // 1 day
    const rewardBP = 100n;       // base 1%

    const elapsed = now - l.lastClaim;
    const periods = elapsed / rewardPeriod;
    if (periods <= 0n) continue;

    const bonusBPMap = {
      1: 10200n,
      3: 10400n,
      6: 10600n,
      12: 10800n,
      24: 11000n
    };

    const bonusBP =
      bonusBPMap[Number(l.lockMonths)] || 10000n;

    const reward =
      (l.amount *
        rewardBP *
        periods *
        bonusBP) /
      10000n /
      10000n;

    pendingRewardWei += reward;
  }

  return {
    totalLocked: formatUnits(totalLocked, 18),
    activeLocks: Number(activeLocks),
    pendingReward: formatUnits(pendingRewardWei, 18)
  };
}
