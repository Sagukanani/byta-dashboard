// src/lib/web3.js
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
    tier: Number(tier),
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

/* ---------------- CLAIM HISTORY (SAFE + WORKING) ---------------- */

export async function getClaimHistory(user) {
  const sc = stakingContract();
  const provider = sc.runner.provider;

  const latest = await provider.getBlockNumber();
  const START = Math.max(latest - 20000, 0); // ~1 day BSC
  const CHUNK = 800; // < 1000 logs limit

  const filter = sc.filters.RewardPaid(user);

  let logs = [];

  for (let from = START; from <= latest; from += CHUNK) {
    const to = Math.min(from + CHUNK - 1, latest);

    try {
      const part = await sc.queryFilter(filter, from, to);
      logs.push(...part);
    } catch (e) {
      console.warn("Skipped blocks", from, to);
    }
  }

  return logs
    .sort((a, b) => b.blockNumber - a.blockNumber)
    .slice(0, 20)
    .map((log) => ({
      amount: formatUnits(log.args.tokenAmount, 18),
      usd: formatUnits(log.args.usdAmount, 18),
      txHash: log.transactionHash,
      type: "Staking Reward",
    }));
}

/* ---------------- RPC TEST ---------------- */

export async function testConnection() {
  try {
    const rpc = new JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    const block = await rpc.getBlockNumber();
    return "Connected. Latest block: " + block;
  } catch (err) {
    return "Connection failed: " + err.message;
  }
}
// ---------------------
// STAKING PENDING REWARD (REAL, NOT EVENT BASED)
// ---------------------
export async function getStakingPendingReward(user) {
  const sc = stakingContract();

  const stake = await sc.stakes(user);
  if (stake.amount === 0n) return "0";

  const rewardBP = await sc.rewardPerPeriodBP(); // basis points
  const rewardPeriod = await sc.rewardPeriod(); // seconds

  const lastClaim = Number(stake.lastClaim);
  if (lastClaim === 0) return "0";

  const now = Math.floor(Date.now() / 1000);
  const elapsed = now - lastClaim;
  if (elapsed < rewardPeriod) return "0";

  const periods = Math.floor(elapsed / Number(rewardPeriod));

  // reward = amount * bp * periods / 10000
  const rewardWei =
    (stake.amount * BigInt(rewardBP) * BigInt(periods)) / 10000n;

  return formatEther(rewardWei);
}
// ---------------------
// REFERRAL INCOME (LAST 20, SAFE)
// ---------------------
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
    } catch (e) {
      console.warn("Referral skip", from, to);
    }
  }

  return formatEther(total);
}
export async function getMyFullTeam(rootUser) {
  const provider = new JsonRpcProvider(import.meta.env.VITE_RPC_URL);
  const sc = new Contract(STAKING_ADDRESS, STAKING_ABI, provider);

  // -----------------------------
  // STEP 1: get ALL direct users
  // -----------------------------
  // ⚠️ This requires a view function in contract
  // Example: getDirectReferrals(address) returns (address[])
  let directUsers = [];
  try {
    directUsers = await sc.getDirectReferrals(rootUser);
  } catch (e) {
    console.error("getDirectReferrals not available in contract");
    return { team: [], leftCount: 0, rightCount: 0 };
  }

  // -----------------------------
  // STEP 2: count full tree per direct user
  // -----------------------------
  async function countAllDownline(user) {
    let total = 0;
    let stack = [user];

    while (stack.length) {
      const current = stack.pop();
      let children = [];

      try {
        children = await sc.getDirectReferrals(current);
      } catch {
        children = [];
      }

      total += children.length;
      stack.push(...children);
    }

    return total;
  }

  const team = [];

  let leftCount = 0;
  let rightCount = 0;

  for (const user of directUsers) {
    const info = await sc.users(user); // or referrerOf mapping
    const side = info.isLeft ? "Left" : "Right";

    const totalCount = await countAllDownline(user);

    team.push({
      wallet: user,
      side,
      totalCount
    });

    if (side === "Left") leftCount += totalCount + 1;
    else rightCount += totalCount + 1;
  }

  return { team, leftCount, rightCount };
}

/* ---------------- REAL PENDING REWARDS (ON-CHAIN) ---------------- */

export async function getPendingStakingRewardUSD(user) {
  const sc = stakingContract();
  const usdWei = await sc.pendingStakingRewardUSD(user);
  return formatEther(usdWei); // USD (18 decimals)
}

export async function getPendingBytaDailyUSD(user) {
  const sc = stakingContract();
  const usdWei = await sc.pendingBytaDailyUSD(user);
  return formatEther(usdWei); // USD (18 decimals)
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
