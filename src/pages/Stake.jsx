import React, { useState, useEffect } from "react";
import {
  tokenContract,
  stakingContract,
  getTokenBalance
} from "../lib/web3";
import { parseUnits, formatUnits } from "ethers";

/* ---------------- REFERRAL FROM URL ---------------- */

function getReferralFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    ref: params.get("ref"),
    side: params.get("side") // left | right
  };
}

async function ensureReferrer(user) {
  const { ref, side } = getReferralFromUrl();
  if (!ref || !side) return;

  const sc = stakingContract();

  try {
    const existing = await sc.referrer(user);
    if (
      existing &&
      existing !== "0x0000000000000000000000000000000000000000"
    ) {
      return;
    }
  } catch {}

  await (await sc.setReferrer(ref, side === "left")).wait();
}

/* ---------------- COMPONENT ---------------- */

export default function Stake({ address }) {
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [balance, setBalance] = useState("0");
  const [stakedBalance, setStakedBalance] = useState("0");
  const [status, setStatus] = useState("");

  /* ---------------- LOAD BALANCES ---------------- */

  useEffect(() => {
    if (!address) {
      setBalance("0");
      setStakedBalance("0");
      return;
    }

    async function load() {
      const bal = await getTokenBalance(address);
      setBalance(bal);

      const sc = stakingContract();
      const stakeInfo = await sc.stakes(address); // ✅ correct
      setStakedBalance(formatUnits(stakeInfo.amount, 18));
    }

    load();
  }, [address]);

  /* ---------------- % BUTTONS ---------------- */

  function handleStakePercent(p) {
    const bal = Number(balance);
    if (!bal || bal <= 0) return;

    setStakeAmount(
      p === 100 ? bal.toString() : ((bal * p) / 100).toFixed(6)
    );
  }

  function handleUnstakePercent(p) {
    const bal = Number(stakedBalance);
    if (!bal || bal <= 0) return;

    setUnstakeAmount(
      p === 100 ? bal.toString() : ((bal * p) / 100).toFixed(6)
    );
  }

  /* ---------------- STAKE ---------------- */

  async function handleStake() {
    try {
      if (!stakeAmount || Number(stakeAmount) <= 0) {
        setStatus("Enter valid stake amount");
        return;
      }

      await ensureReferrer(address);

      const tc = tokenContract();
      const sc = stakingContract();
      const wei = parseUnits(stakeAmount, 18);

      setStatus("Approving...");
      await (await tc.approve(sc.target, wei)).wait();

      setStatus("Staking...");
      await (await sc.stake(wei)).wait();

      setStakeAmount("");
      setBalance(await getTokenBalance(address));
      setStatus("Stake successful");
    } catch (e) {
      setStatus("Stake failed: " + e.message);
    }
  }

  /* ---------------- UNSTAKE ---------------- */

  async function handleUnstake() {
    try {
      if (!unstakeAmount || Number(unstakeAmount) <= 0) {
        setStatus("Enter valid unstake amount");
        return;
      }

      const sc = stakingContract();
      const wei = parseUnits(unstakeAmount, 18);

      setStatus("Unstaking...");
      await (await sc.unstake(wei)).wait();

      setUnstakeAmount("");
      setStatus("Unstake successful");
    } catch (e) {
      setStatus("Unstake failed: " + e.message);
    }
  }

  if (!address) {
    return (
      <div className="main-container">
        <h2>Please connect your wallet</h2>
      </div>
    );
  }

  return (
    <div className="main-container">
      <h1>Stake / Unstake BYTA</h1>

      {/* WALLET */}
      <div className="card section">
        <div className="label">Wallet</div>
        <div className="sub-value accent-blue">{address}</div>
      </div>

      {/* STAKE */}
      <div className="card section">
        <div className="label">Stake BYTA</div>
        <div className="sub-value">
          Wallet Balance: <b>{balance} BYTA</b>
        </div>

       <input
  value={stakeAmount}
  onChange={(e) => setStakeAmount(e.target.value)}
  placeholder="Enter stake amount"
  style={{
    width: "100%",
    padding: "12px",
    marginTop: 8,
    borderRadius: 10
  }}
/>


        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {[25, 50, 75].map((p) => (
            <button
              key={p}
              className="btn btn-secondary"
              onClick={() => handleStakePercent(p)}
            >
              {p}%
            </button>
          ))}
          <button
            className="btn btn-secondary"
            onClick={() => handleStakePercent(100)}
          >
            MAX
          </button>
        </div>

       <button
  className="btn btn-primary"
  style={{
    marginTop: 8,
    padding: "12px 20px",
    borderRadius: 12
  }}
  onClick={handleStake}
>
  Stake
</button>

      </div>

      {/* UNSTAKE */}
      <div className="card section">
        <div className="label">Unstake BYTA</div>
        <div className="sub-value">
          Staked Balance: <b>{stakedBalance} BYTA</b>
        </div>

       <input
  value={unstakeAmount}
  onChange={(e) => setUnstakeAmount(e.target.value)}
  placeholder="Enter unstake amount"
  style={{
    width: "100%",
    padding: "12px",
    marginTop: 8,
    borderRadius: 10
  }}
/>


        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {[25, 50, 75].map((p) => (
            <button
              key={p}
              className="btn btn-secondary"
              onClick={() => handleUnstakePercent(p)}
            >
              {p}%
            </button>
          ))}
          <button
            className="btn btn-secondary"
            onClick={() => handleUnstakePercent(100)}
          >
            MAX
          </button>
        </div>

      <button
  className="btn"
  style={{
    marginTop: 8,
    padding: "12px 22px",
    borderRadius: 12,
    background: "#f80606",
    color: "#fff",
    fontWeight: 600,
    border: "none"
  }}
  onClick={handleUnstake}
>
  Unstake
</button>


      </div>

      {status && (
        <div className="card section">
          <div className="sub-value">{status}</div>
        </div>
      )}
    </div>
  );
}
