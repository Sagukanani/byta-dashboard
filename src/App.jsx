import React, { useState } from "react";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/dashboard.jsx";
import Stake from "./pages/Stake.jsx";
import BuySell from "./pages/buysell.jsx";
import Team from "./pages/team.jsx";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState("dashboard");

  // 🔴 IMPORTANT
  const [wallet, setWallet] = useState(null);

  function handleNavigate(p) {
    setPage(p);
    setSidebarOpen(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0B1220", color: "#fff" }}>
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            position: "fixed",
            top: 20,
            left: 20,
            padding: 10,
            borderRadius: 8,
            background: "#0f172a",
            border: "1px solid rgba(255,255,255,0.1)",
            cursor: "pointer",
            zIndex: 20
          }}
        >
          <div style={{ width: 22, height: 3, background: "#fff", marginBottom: 4 }} />
          <div style={{ width: 22, height: 3, background: "#fff", marginBottom: 4 }} />
          <div style={{ width: 22, height: 3, background: "#fff" }} />
        </button>
      )}

      {sidebarOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100%",
          width: 260,
          background: "#071122",
          zIndex: 30,
        }}>
          <Sidebar
            onClose={() => setSidebarOpen(false)}
            onNavigate={handleNavigate}
          />
        </div>
      )}

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 20,
          }}
        />
      )}

      <div style={{ padding: "80px 20px" }}>
        {page === "dashboard" && <Dashboard wallet={wallet} setWallet={setWallet} />}
        {page === "stake" && <Stake wallet={wallet} />}
        {page === "team" && <Team wallet={wallet} />}
        {page === "buysell" && <BuySell wallet={wallet} />}
      </div>
    </div>
  );
}
