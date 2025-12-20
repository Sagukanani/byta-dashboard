import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import { connectWallet } from "./lib/web3";

import Dashboard from "./pages/dashboard.jsx";
import Stake from "./pages/Stake.jsx";
import BuySell from "./pages/buysell.jsx";
import Team from "./pages/team.jsx";

// 🔹 helper ONLY for copy (new, safe)
function copyText(text) {
  navigator.clipboard.writeText(text);
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState("dashboard");

  const [wallet, setWallet] = useState({
    connected: false,
    address: ""
  });
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);

  function handleNavigate(p) {
  setPage((prev) => (prev === p ? prev : p));
  setSidebarOpen(false);
}

async function handleConnect() {
  const addr = await connectWallet();
  setWallet({
    connected: true,
    address: addr.toLowerCase()
  });
}

  
  return (
    <div style={{ minHeight: "100vh", background: "#323131ff", color: "#fff" }}>
      {/* SIDEBAR BUTTON – UNCHANGED */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            position: "fixed",
            top: 20,
            left: 20,
            padding: 10,
            borderRadius: 8,
            background: "#3d3c3cff",
            cursor: "pointer",
            zIndex: 20
          }}
        >
          <div style={{ width: 22, height: 3, background: "#f72a06ff", marginBottom: 4 }} />
          <div style={{ width: 22, height: 3, background: "#f72a06ff", marginBottom: 4 }} />
          <div style={{ width: 22, height: 3, background: "#f72a06ff" }} />
        </button>
      )}

      {/* 🔥 TOP RIGHT WALLET BUTTON */}
      <button
        onClick={() => {
          if (!wallet.connected) {
            handleConnect();
          } else {
            setWalletMenuOpen(true);
          }
        }}
        style={{
          position: "fixed",
          top: 20,
          right: 24,
          padding: "12px 22px",
          borderRadius: 999,
          background: "#e62806f0",
          color: "#ffff",
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
          zIndex: 40
        }}
      >
        {wallet.connected
          ? wallet.address.slice(0, 6) + "..." + wallet.address.slice(-4)
          : "Connect Wallet"}
      </button>

      {/* WALLET MENU */}
      {walletMenuOpen && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: 200,
              height: "100%",
              background: "#4c4b4bff",
              zIndex: 50,
              padding: 20,
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont"
            }}
          >
            {/* ADDRESS + COPY */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <strong style={{ fontSize: 14 }}>
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </strong>
                <button
                  onClick={() => copyText(wallet.address)}
                  style={{
                    fontSize: 12,
                    padding: "2px 6px",
                    cursor: "pointer"
                  }}
                >
                  Copy
                </button>
              </div>

              <button onClick={() => setWalletMenuOpen(false)}>✕</button>
            </div>

            <hr />


            {/* DISCONNECT */}
            <button
              style={{ marginTop: 24, color: "red", cursor: "pointer" }}
              onClick={() => {
                setWallet({ connected: false, address: "" });
                setWalletMenuOpen(false);
              }}
            >
              Disconnect
            </button>
          </div>

          {/* OVERLAY */}
          <div
            onClick={() => setWalletMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 40
            }}
          />
        </>
      )}
{/* SIDEBAR */}
{sidebarOpen && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      height: "100%",
      width: 260,
      background: "#f8f5f5ff",
      zIndex: 30
    }}
  >
    <Sidebar
  onClose={() => setSidebarOpen(false)}
  onNavigate={handleNavigate}
  currentPage={page}
/>

  </div>
)}

{/* SIDEBAR OVERLAY */}
{sidebarOpen && (
  <div
    onClick={() => setSidebarOpen(false)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(84, 82, 82, 0.07)",
      zIndex: 20
    }}
  />
)}

      {/* MAIN CONTENT – UNCHANGED */}
     <div style={{ padding: "80px 20px" }}>

  <div style={{ display: page === "dashboard" ? "block" : "none" }}>
    <Dashboard address={wallet.address} />
  </div>

  <div style={{ display: page === "stake" ? "block" : "none" }}>
    <Stake address={wallet.address} />
  </div>

  <div style={{ display: page === "team" ? "block" : "none" }}>
    <Team address={wallet.address} />
  </div>

  <div style={{ display: page === "buysell" ? "block" : "none" }}>
    <BuySell />
  </div>

</div>

    </div>
  );
}
