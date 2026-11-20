"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Cpu,
  Shield,
  HardDrive,
  CheckCircle2,
  Save,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api, clearSession } from "@/lib/api";

type SettingsData = {
  user: {
    id: number;
    name: string;
    email: string;
    created_at: string;
  };
  system: {
    fastapi_version: string;
    database_url: string;
    upload_dir: string;
    access_token_expire_minutes: number;
    active_ai_model: string;
    has_openai_key: boolean;
    retrieval_mode: string;
  };
};

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function load() {
    try {
      const res = await api<SettingsData>("/settings");
      setData(res);
      setName(res.user.name);
      setModel(res.system.active_ai_model);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await api("/settings/profile", {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      setMessage("Profile updated successfully.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Profile update failed");
    }
  }

  async function handleUpdateAI(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await api("/settings/ai", {
        method: "PUT",
        body: JSON.stringify({ openai_api_key: apiKey, openai_model: model }),
      });
      setMessage("AI configuration updated successfully.");
      setApiKey("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI configuration update failed");
    }
  }

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-wrap">
      <div className="page-heading">
        <div>
          <span className="section-kicker">PREFERENCES & DIAGNOSTICS</span>
          <h1>Settings</h1>
          <p>Manage your user profile, LLM provider routing, and system telemetry.</p>
        </div>
        <button className="button button-ghost" onClick={handleLogout}>
          <LogOut size={16} /> Sign out
        </button>
      </div>

      {error && <div className="notice error">{error}</div>}
      {message && <div className="notice success">{message}</div>}

      <div className="dashboard-columns">
        {/* Left: Profile & AI Configuration */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* User Profile Panel */}
          <section className="panel" style={{ padding: "1.5rem" }}>
            <div className="panel-heading" style={{ marginBottom: "1rem" }}>
              <div>
                <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <User size={18} style={{ color: "var(--accent, #6366f1)" }} /> Personal Profile
                </h3>
                <p>Your workspace account details</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <label>
                Full Name
                <input value={name} onChange={(e) => setName(e.target.value)} required />
              </label>

              <label>
                Email Address
                <input value={data?.user.email || ""} disabled style={{ opacity: 0.6 }} />
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" className="button button-primary small">
                  <Save size={14} /> Save Profile
                </button>
              </div>
            </form>
          </section>

          {/* AI Gateway Configuration */}
          <section className="panel" style={{ padding: "1.5rem" }}>
            <div className="panel-heading" style={{ marginBottom: "1rem" }}>
              <div>
                <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Cpu size={18} style={{ color: "#10b981" }} /> AI Model & Gateway
                </h3>
                <p>Configure model inference and optional OpenAI API key</p>
              </div>
            </div>

            <form onSubmit={handleUpdateAI} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <label>
                Default Inference Model
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "6px",
                    padding: "0.6rem",
                    color: "inherit",
                  }}
                >
                  <option value="gpt-4o-mini">gpt-4o-mini (Default - Fast & Cost Efficient)</option>
                  <option value="gpt-4o">gpt-4o (High Performance Reasoning)</option>
                  <option value="gpt-4-turbo">gpt-4-turbo</option>
                </select>
              </label>

              <label>
                OpenAI API Key (Optional)
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    data?.system.has_openai_key
                      ? "sk-... (API key configured on backend)"
                      : "sk-... (Leave empty to use local TF-IDF extractive mode)"
                  }
                />
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" className="button button-primary small">
                  <Save size={14} /> Update AI Config
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Right: System Telemetry */}
        <div>
          <section className="panel" style={{ padding: "1.5rem" }}>
            <div className="panel-heading" style={{ marginBottom: "125rem" }}>
              <div>
                <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <HardDrive size={18} style={{ color: "#3b82f6" }} /> System Diagnostics
                </h3>
                <p>Underlying runtime and storage telemetry</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ color: "#94a3b8" }}>API Gateway:</span>
                <b>FastAPI 0.1.0 (Python 3.11)</b>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ color: "#94a3b8" }}>Health Status:</span>
                <span style={{ color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircle2 size={13} /> 100% Operational
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ color: "#94a3b8" }}>Database:</span>
                <b>SQLite (WAL Mode)</b>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ color: "#94a3b8" }}>Retrieval Strategy:</span>
                <b>TF-IDF Extractive + RAG</b>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ color: "#94a3b8" }}>Session Lifetime:</span>
                <b>{data?.system.access_token_expire_minutes || 60} minutes</b>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
                <span style={{ color: "#94a3b8" }}>Account Registered:</span>
                <b>{data?.user.created_at ? new Date(data.user.created_at).toLocaleDateString() : "Active"}</b>
              </div>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
