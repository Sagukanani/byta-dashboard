import { useState } from "react";

/* ================= THEME CONFIG (ONLY EDIT THIS) ================= */

const THEME = {
  colors: {
    bg: "#414142ff",
    card: "#626364ff",
    border: "#2f2f30ff",
    primary: "#e62806f0",
    secondary: "#ffffffff",
    textMain: "#ffffff",
    textMuted: "rgba(255,255,255,0.65)",
    buttonInactive: "#626364ff",
    resulttext: "#fcc40bf0",
  },

  radius: {
    card: 16,
    input: 12,
    button: 10,
  },

  spacing: {
    sectionGap: 25,
    inputGap: 14,
  },

  font: {
    title: 22,
    label: 14,
    value: 16,
    result: 18,
  },
};

/* ================= STAKING LOGIC (DO NOT TOUCH) ================= */

const longTermRates = {
  1: 0.27,
  3: 0.29,
  6: 0.31,
  12: 0.33,
  24: 0.35,
};

export default function StakingCalculator() {
  const [mode, setMode] = useState("normal");
  const [amount, setAmount] = useState(100);
  const [months, setMonths] = useState(3);
  const [compound, setCompound] = useState(false);

  let result = null;

  if (mode === "normal") {
    if (!compound) {
      const reward = amount * 0.25 * months;
      result = { reward, final: amount + reward };
    } else {
      const final = amount * Math.pow(1.25, months);
      result = { reward: final - amount, final };
    }
  }

  if (mode === "long") {
    const rate = longTermRates[months];
    const reward = amount * rate * months;
    result = { rate: rate * 100, reward, final: amount + reward };
  }

  /* ================= UI ================= */

  return (
    <div
      style={{
        background: THEME.colors.bg,
        padding: 24,
        borderRadius: THEME.radius.card,
        border: `1px solid ${THEME.colors.border}`,
        color: THEME.colors.textMain,
      }}
    >
      {/* MODE SWITCH */}
      <div style={{ display: "flex", gap: 6, marginBottom: THEME.spacing.sectionGap }}>
        {["normal", "long"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: THEME.radius.button,
              background:
                mode === m ? THEME.colors.primary : THEME.colors.buttonInactive,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {m === "normal" ? "Normal Staking" : "Long-Term Staking"}
          </button>
        ))}
      </div>

      {/* AMOUNT */}
      <label style={{ fontSize: THEME.font.label, opacity: 0.8 }}>
        Stake Amount (BYTA)
      </label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(+e.target.value)}
        style={{
          width: "95%",
          marginTop: 6,
          marginBottom: THEME.spacing.inputGap,
          padding: 12,
          borderRadius: THEME.radius.input,
          background: THEME.colors.card,
          border: `1px solid ${THEME.colors.border}`,
          color: "#fff",
          fontSize: THEME.font.value,
        }}
      />

      {/* NORMAL MODE */}
      {mode === "normal" && (
        <>
          <label style={{ fontSize: THEME.font.label, opacity: 0.8 }}>
            Duration (Months)
          </label>
          <input
            type="number"
            min={1}
            max={24}
            value={months}
            onChange={(e) => setMonths(+e.target.value)}
            style={{
              width: "95%",
              marginTop: 6,
              marginBottom: THEME.spacing.inputGap,
              padding: 12,
              borderRadius: THEME.radius.input,
              background: THEME.colors.card,
              border: `1px solid ${THEME.colors.border}`,
              color: "#fff",
            }}
          />

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={compound}
              onChange={() => setCompound(!compound)}
            />
            <span style={{ fontSize: THEME.font.label }}>
              Enable Compounding
            </span>
          </label>
        </>
      )}

      {/* LONG MODE */}
      {mode === "long" && (
        <>
          <label style={{ fontSize: THEME.font.label, opacity: 0.8 }}>
            Lock Period
          </label>
          <select
            value={months}
            onChange={(e) => setMonths(+e.target.value)}
            style={{
              width: "100%",
              marginTop: 6,
              padding: 12,
              borderRadius: THEME.radius.input,
              background: THEME.colors.card,
              border: `1px solid ${THEME.colors.border}`,
              color: "#ffff",
            }}
          >
            {[1, 3, 6, 12, 24].map((m) => (
              <option key={m} value={m}>
                {m} Months
              </option>
            ))}
          </select>
        </>
      )}

      {/* RESULT */}
      {result && (
        <div
          style={{
            marginTop: THEME.spacing.sectionGap,
            padding: 16,
            width: "94%",
            borderRadius: THEME.radius.card,
            background: THEME.colors.card,
            border: `1px solid ${THEME.colors.border}`,
          }}
        >
          {mode === "long" && (
            <div style={{ opacity: 0.8, marginBottom: 6 }}>
              Monthly Reward: {result.rate.toFixed(2)}%
            </div>
          )}

          <div style={{ fontSize: THEME.font.result }}>
            Total Reward:{" "}
            <span style={{ color: THEME.colors.resulttext }}>
              {result.reward.toFixed(2)} BYTA
            </span>
          </div>

          <div style={{ fontSize: THEME.font.result, marginTop: 6 }}>
            Final Amount:{" "}
            <span style={{ color: THEME.colors.resulttext }}>
              {result.final.toFixed(2)} BYTA
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
