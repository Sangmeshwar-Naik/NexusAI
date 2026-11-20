"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Workflow,
  Play,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  Terminal,
  Activity,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

type Step = {
  name: string;
  status: string;
  tool: string;
};

type WorkflowItem = {
  id: number;
  name: string;
  trigger: string;
  description: string;
  steps: Step[];
  is_active: boolean;
  last_run_at: string;
  runs_count: number;
};

type RunResponse = {
  message: string;
  runs_count: number;
  last_run_at: string;
  steps_executed: number;
  documents_processed: number;
  logs: string[];
};

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [runningId, setRunningId] = useState<number | null>(null);
  const [runLogs, setRunLogs] = useState<{ id: number; logs: string[]; message: string } | null>(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  // New workflow
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("On File Upload");
  const [description, setDescription] = useState("");
  const [stepInput, setStepInput] = useState("Extract Text, Cluster Topics, Summarize Insights");

  async function load() {
    try {
      const data = await api<WorkflowItem[]>("/workflows");
      setWorkflows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load workflows");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRun(id: number) {
    setRunningId(id);
    setError("");
    setRunLogs(null);
    try {
      const res = await api<RunResponse>(`/workflows/${id}/run`, { method: "POST" });
      setRunLogs({ id, logs: res.logs, message: res.message });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Workflow run failed");
    } finally {
      setRunningId(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const steps = stepInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      await api("/workflows", {
        method: "POST",
        body: JSON.stringify({ name, trigger, description, steps }),
      });
      setShowModal(false);
      setName("");
      setDescription("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workflow");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this workflow pipeline?")) return;
    try {
      await api(`/workflows/${id}`, { method: "DELETE" });
      if (runLogs?.id === id) setRunLogs(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-wrap">
      <div className="page-heading">
        <div>
          <span className="section-kicker">ORCHESTRATION PIPELINES</span>
          <h1>Workflows</h1>
          <p>Automate multi-stage document ingestion, risk scanning, and periodic intelligence digests.</p>
        </div>
        <button className="button button-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Create pipeline
        </button>
      </div>

      {error && <div className="notice error">{error}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {workflows.map((wf) => {
          const isThisRunning = runningId === wf.id;
          const hasLogs = runLogs?.id === wf.id;

          return (
            <div key={wf.id} className="panel" style={{ padding: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div className="stat-icon blue" style={{ width: "42px", height: "42px", borderRadius: "10px" }}>
                    <Workflow size={20} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{wf.name}</h3>
                      <span className="status-pill">
                        <i /> {wf.trigger}
                      </span>
                    </div>
                    <p style={{ margin: "0.35rem 0 0 0", color: "#94a3b8", fontSize: "0.85rem", maxWidth: "600px" }}>
                      {wf.description}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <button
                    className="button button-primary small"
                    onClick={() => handleRun(wf.id)}
                    disabled={isThisRunning}
                  >
                    {isThisRunning ? (
                      <>
                        <Sparkles size={14} /> Running...
                      </>
                    ) : (
                      <>
                        <Play size={14} /> Trigger Pipeline
                      </>
                    )}
                  </button>
                  <button
                    className="icon-button danger-icon"
                    onClick={() => handleDelete(wf.id)}
                    title="Delete Pipeline"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Pipeline Stages Visualizer */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  margin: "1.25rem 0 0.5rem 0",
                  padding: "0.75rem",
                  background: "rgba(0,0,0,0.2)",
                  borderRadius: "8px",
                  overflowX: "auto",
                }}
              >
                <small style={{ color: "#64748b", fontWeight: 600, paddingRight: "0.5rem" }}>STAGES:</small>
                {wf.steps.map((st, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", whiteSpace: "nowrap" }}>
                    <div
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        fontSize: "0.78rem",
                      }}
                    >
                      <b>{i + 1}. {st.name}</b>
                      <span style={{ color: "#94a3b8", marginLeft: "4px" }}>({st.tool})</span>
                    </div>
                    {i < wf.steps.length - 1 && <ArrowRight size={13} style={{ color: "#64748b" }} />}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem", fontSize: "0.78rem", color: "#94a3b8" }}>
                <span>Last execution: {wf.last_run_at}</span>
                <span>Total runs: {wf.runs_count}</span>
              </div>

              {/* Run Logs Drawer */}
              {hasLogs && runLogs && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  style={{
                    marginTop: "1rem",
                    padding: "0.85rem",
                    borderRadius: "6px",
                    background: "rgba(16, 185, 129, 0.05)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    fontSize: "0.82rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem", color: "#10b981" }}>
                    <CheckCircle2 size={15} />
                    <strong>{runLogs.message}</strong>
                  </div>
                  {runLogs.logs.map((log, li) => (
                    <div key={li} style={{ fontFamily: "monospace", color: "#cbd5e1", padding: "1px 0" }}>
                      {log}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Workflow Modal */}
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
                <h3 style={{ margin: 0 }}>Create Workflow Pipeline</h3>
                <button className="icon-button" onClick={() => setShowModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <label>
                  Workflow Name
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Daily Document Clustering"
                  />
                </label>
                <label>
                  Trigger Mode
                  <select
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value)}
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "6px",
                      padding: "0.6rem",
                      color: "inherit",
                    }}
                  >
                    <option value="On File Upload">On File Upload</option>
                    <option value="Scheduled (Daily)">Scheduled (Daily)</option>
                    <option value="Scheduled (Weekly)">Scheduled (Weekly)</option>
                    <option value="Manual Dispatch">Manual Dispatch</option>
                  </select>
                </label>
                <label>
                  Description
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this pipeline automates..."
                  />
                </label>
                <label>
                  Pipeline Stages (comma-separated)
                  <input
                    value={stepInput}
                    onChange={(e) => setStepInput(e.target.value)}
                    placeholder="Stage 1, Stage 2, Stage 3"
                  />
                </label>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <button type="button" className="button" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="button button-primary">
                    Create Pipeline
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
