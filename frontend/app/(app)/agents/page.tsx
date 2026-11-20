"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Boxes,
  Sparkles,
  Play,
  Plus,
  Trash2,
  CheckCircle2,
  Cpu,
  Clock,
  ArrowRight,
  Bot,
  Terminal,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

type Agent = {
  id: number;
  name: string;
  role: string;
  description: string;
  model: string;
  system_prompt: string;
  is_active: boolean;
  runs_count: number;
};

type RunResult = {
  agent_name: string;
  model: string;
  steps: string[];
  answer: string;
  documents_referenced: string[];
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  // New agent form
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");

  async function load() {
    try {
      const data = await api<Agent[]>("/agents");
      setAgents(data);
      if (data.length > 0 && !selectedAgent) {
        setSelectedAgent(data[0]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load agents");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRun(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAgent || !prompt.trim() || running) return;
    setRunning(true);
    setError("");
    setRunResult(null);
    try {
      const res = await api<RunResult>(`/agents/${selectedAgent.id}/run`, {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      setRunResult(res);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Agent execution failed");
    } finally {
      setRunning(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;
    try {
      await api("/agents", {
        method: "POST",
        body: JSON.stringify({ name, role, description, model }),
      });
      setShowModal(false);
      setName("");
      setRole("");
      setDescription("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create agent");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this agent?")) return;
    try {
      await api(`/agents/${id}`, { method: "DELETE" });
      if (selectedAgent?.id === id) setSelectedAgent(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-wrap">
      <div className="page-heading">
        <div>
          <span className="section-kicker">AUTONOMOUS WORKERS</span>
          <h1>AI Agents</h1>
          <p>Deploy specialized multi-agent workers configured for research, synthesis, and auditing.</p>
        </div>
        <button className="button button-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Deploy new agent
        </button>
      </div>

      {error && <div className="notice error">{error}</div>}

      <div className="dashboard-columns">
        {/* Left Column: Agent Roster */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {agents.map((ag) => {
            const isSelected = selectedAgent?.id === ag.id;
            return (
              <div
                key={ag.id}
                onClick={() => setSelectedAgent(ag)}
                className="panel"
                style={{
                  cursor: "pointer",
                  padding: "1.25rem",
                  borderColor: isSelected ? "var(--accent, #6366f1)" : undefined,
                  background: isSelected ? "rgba(99, 102, 241, 0.04)" : undefined,
                  transition: "border-color 0.2s, background 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div className="stat-icon violet" style={{ width: "36px", height: "36px", borderRadius: "8px" }}>
                      <Bot size={18} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600 }}>{ag.name}</h3>
                      <small style={{ color: "var(--foreground-muted, #94a3b8)" }}>{ag.role}</small>
                    </div>
                  </div>
                  <span className="status-pill">
                    <i /> Active
                  </span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--foreground-muted, #cbd5e1)", margin: "0.75rem 0", lineHeight: 1.5 }}>
                  {ag.description}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.75rem", borderTop: "1px solid rgba(255, 255, 255, 0.06)", fontSize: "0.78rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#94a3b8" }}>
                    <Cpu size={13} /> {ag.model}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#94a3b8" }}>
                    <Clock size={13} /> {ag.runs_count} run{ag.runs_count === 1 ? "" : "s"}
                  </span>
                  <button
                    className="icon-button danger-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(ag.id);
                    }}
                    title="Delete Agent"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Execution Playground */}
        <div>
          <div className="panel" style={{ padding: "1.5rem" }}>
            <div className="panel-heading" style={{ marginBottom: "1rem" }}>
              <div>
                <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Terminal size={18} style={{ color: "var(--accent, #6366f1)" }} />
                  {selectedAgent ? `Interact with ${selectedAgent.name}` : "Select an Agent"}
                </h3>
                <p>{selectedAgent?.role || "Choose an agent on the left to assign a task."}</p>
              </div>
            </div>

            <form onSubmit={handleRun}>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  selectedAgent
                    ? `Instruct ${selectedAgent.name} (e.g. "Extract the top 3 financial metrics from my Q3 report", "Audit liabilities in uploaded contracts")...`
                    : "Select an agent first..."
                }
                rows={4}
                style={{
                  width: "100%",
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  color: "inherit",
                  fontFamily: "inherit",
                  fontSize: "0.9rem",
                  resize: "vertical",
                  marginBottom: "1rem",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={!selectedAgent || !prompt.trim() || running}
                  className="button button-primary"
                >
                  {running ? (
                    <>
                      <Sparkles size={16} /> Reasoning across library...
                    </>
                  ) : (
                    <>
                      <Play size={15} /> Execute Agent Task
                    </>
                  )}
                </button>
              </div>
            </form>

            {runResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: "1.5rem",
                  padding: "1rem",
                  borderRadius: "8px",
                  background: "rgba(99, 102, 241, 0.05)",
                  border: "1px solid rgba(99, 102, 241, 0.2)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <CheckCircle2 size={16} style={{ color: "#10b981" }} />
                  <strong style={{ fontSize: "0.9rem" }}>Execution Completed ({runResult.agent_name})</strong>
                </div>

                <div style={{ margin: "0.5rem 0 1rem 0" }}>
                  <small style={{ color: "#94a3b8", display: "block", marginBottom: "0.3rem" }}>REASONING STEPS</small>
                  {runResult.steps.map((s, idx) => (
                    <div key={idx} style={{ fontSize: "0.8rem", color: "#cbd5e1", padding: "2px 0" }}>
                      • {s}
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "0.75rem" }}>
                  <small style={{ color: "#94a3b8", display: "block", marginBottom: "0.4rem" }}>AGENT RESPONSE</small>
                  <div style={{ whiteSpace: "pre-wrap", fontSize: "0.88rem", lineHeight: 1.6 }}>
                    {runResult.answer}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Deploy Agent Modal */}
      <AnimatePresence>
        {showModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.7)",
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
              style={{ maxWidth: "480px", width: "100%", padding: "1.75rem" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0 }}>Deploy New Agent</h3>
                <button className="icon-button" onClick={() => setShowModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <label>
                  Agent Name
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Financial Forensics Bot"
                  />
                </label>
                <label>
                  Role / Specialization
                  <input
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Balance sheet analysis & GAAP compliance"
                  />
                </label>
                <label>
                  Description
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of what this agent owns..."
                  />
                </label>
                <label>
                  Base Model
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
                    <option value="gpt-4o-mini">gpt-4o-mini (Fast & efficient)</option>
                    <option value="gpt-4o">gpt-4o (Deep reasoning)</option>
                    <option value="claude-3-5-sonnet">claude-3-5-sonnet (High precision)</option>
                  </select>
                </label>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <button type="button" className="button" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="button button-primary">
                    Deploy Agent
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
