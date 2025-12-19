import React, { useState, useEffect } from "react";
import {
  tokenContract,
  stakingContract,
  getTokenBalance
} from "../lib/web3";

import { parseUnits } from "ethers";

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

  // 🔒 Mobile wallets safe-guard
  try {
    const existing = await sc.referrer(user);
    if (
      existing &&
      existing !== "0x0000000000000000000000000000000000000000"
    ) {
      return;
    }
  } catch (e) {
    // ignore decode error (Bitget / mobile issue)
  }

  const tx = await sc.setReferrer(ref, side === "left");
  await tx.wait();
}

/* ---------------- COMPONENT ---------------- */

export default function Stake({ address }) {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [balance, setBalance] = useState("0");

  /* ---------------- CONNECT ---------------- */

  useEffect(() => {
  if (!address) {
    setBalance("0");
    return;
  }

  getTokenBalance(address).then(setBalance);
}, [address]);


  /* ---------------- STAKE ---------------- */

  async function handleStake() {
    try {
      if (!amount || Number(amount) <= 0) {
        setStatus("Enter valid amount");
        return;
      }

      const user = address;
      await ensureReferrer(user);


      const tc = tokenContract();
      const sc = stakingContract();
      const wei = parseUnits(amount, 18);

      setStatus("Approving...");
      await (await tc.approve(sc.target, wei)).wait();

      setStatus("Staking...");
      await (await sc.stake(wei)).wait();

      setStatus("Stake successful");
      setBalance(await getTokenBalance(address));
    } catch (e) {
      setStatus("Stake failed: " + e.message);
    }
  }

  /* ---------------- UNSTAKE ---------------- */

  async function handleUnstake() {
    try {
      if (!amount || Number(amount) <= 0) {
        setStatus("Enter valid amount");
        return;
      }

      const sc = stakingContract();
      const wei = parseUnits(amount, 18);

      setStatus("Unstaking...");
      await (await sc.unstake(wei)).wait();

      setStatus("Unstake successful");
    } catch (e) {
      setStatus("Unstake failed: " + e.message);
    }
  }

  /* ---------------- CLAIM ---------------- */

  async function handleClaim() {
    try {
      const sc = stakingContract();
      setStatus("Claiming reward...");
      await (await sc.claim()).wait();
      setStatus("Reward claimed");
    } catch (e) {
      setStatus("Claim failed: " + e.message);
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

      
      {address && (
        <>
          <div className="card section">
            <div className="label">Wallet</div>
            <div className="sub-value accent-blue">{address}</div>
          </div>

          <div className="card section">
            <div className="label">Balance</div>
            <div className="value accent-purple">{balance} BYTA</div>
          </div>

          <div className="card section">
            <div className="label">Amount</div>

            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter BYTA amount"
            />

            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button type="button" className="btn btn-primary" onClick={handleStake}>
                Stake
              </button>

              <button type="button" className="btn btn-secondary" onClick={handleUnstake}>
                Unstake
              </button>

              <button type="button" className="btn btn-copy" onClick={handleClaim}>
                Claim
              </button>
            </div>

            {status && <div className="sub-value" style={{ marginTop: 12 }}>{status}</div>}
          </div>
        </>
      )}
    </div>
  );
}
