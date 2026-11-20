"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plug,
  CheckCircle2,
  XCircle,
  Settings,
  RefreshCw,
  Database,
  Cloud,
  MessageSquare,
  Sparkles,
  Layers,
  X,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api";

type IntegrationItem = {
  id: number;
  key: string;
  name: string;
  category: string;
  is_connected: boolean;
  config: Record<string, any>;
  last_synced_at: string;
};

const ICONS: Record<string, any> = {
  openai: Sparkles,
  gdrive: Cloud,
  slack: MessageSquare,
  postgres: Database,
  notion: Layers,
  s3: Cloud,
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeConfig, setActiveConfig] = useState<IntegrationItem | null>(null);

  async function load() {
    try {
      const data = await api<IntegrationItem[]>("/integrations");
      setIntegrations(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load integrations");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(key: string, currentState: boolean) {
    setError("");
    setMessage("");
    try {
      const res = await api<{ is_connected: boolean; last_synced_at: string }>(
        `/integrations/${key}/toggle`,
        {
          method: "POST",
          body: JSON.stringify({ is_connected: !currentState }),
        }
      );
      setMessage(
        `${key.toUpperCase()} integration is now ${res.is_connected ? "connected" : "disconnected"}.`
      );
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Toggle failed");
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-wrap">
      <div className="page-heading">
        <div>
          <span className="section-kicker">CONNECTED ECOSYSTEM</span>
          <h1>Integrations</h1>
          <p>Link third-party storage, LLM gateways, vector databases, and team collaboration tools.</p>
        </div>
      </div>

      {error && <div className="notice error">{error}</div>}
      {message && <div className="notice success">{message}</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1.25rem",
          marginTop: "1rem",
        }}
      >
        {integrations.map((it) => {
          const Icon = ICONS[it.key] || Plug;

          return (
            <motion.div whileHover={{ y: -3 }} key={it.id} className="panel" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    className={`stat-icon ${it.is_connected ? "green" : "amber"}`}
                    style={{ width: "40px", height: "40px", borderRadius: "10px" }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600 }}>{it.name}</h3>
                    <small style={{ color: "#94a3b8" }}>{it.category}</small>
                  </div>
                </div>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.75rem",
                    padding: "3px 8px",
                    borderRadius: "12px",
                    background: it.is_connected ? "rgba(16, 185, 129, 0.12)" : "rgba(255,255,255,0.06)",
                    color: it.is_connected ? "#10b981" : "#94a3b8",
                  }}
                >
                  {it.is_connected ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  {it.is_connected ? "Active" : "Standby"}
                </span>
              </div>

              <div
                style={{
                  background: "rgba(0,0,0,0.2)",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  fontSize: "0.8rem",
                  color: "#cbd5e1",
                  margin: "0.75rem 0",
                }}
              >
                <div style={{ color: "#94a3b8", marginBottom: "0.25rem" }}>STATUS & TELEMETRY:</div>
                <div>{it.last_synced_at}</div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "1.25rem",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setActiveConfig(it)}
                  title="Configure"
                >
                  <Settings size={16} />
                </button>

                <button
                  onClick={() => toggle(it.key, it.is_connected)}
                  className={`button small ${it.is_connected ? "button-ghost" : "button-primary"}`}
                >
                  {it.is_connected ? "Disconnect" : "Connect Now"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Configuration Drawer Modal */}
      <AnimatePresence>
        {activeConfig && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "1rem",
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="panel"
              style={{ maxWidth: "440px", width: "100%", padding: "1.75rem" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0 }}>Configure {activeConfig.name}</h3>
                <button className="icon-button" onClick={() => setActiveConfig(null)}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ margin: "1rem 0", fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.6 }}>
                Active parameters for <b>{activeConfig.name}</b>:
                <pre
                  style={{
                    background: "rgba(0,0,0,0.35)",
                    padding: "0.85rem",
                    borderRadius: "6px",
                    color: "#cbd5e1",
                    fontSize: "0.8rem",
                    marginTop: "0.5rem",
                    overflowX: "auto",
                  }}
                >
                  {JSON.stringify(activeConfig.config, null, 2)}
                </pre>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <button className="button" onClick={() => setActiveConfig(null)}>
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
