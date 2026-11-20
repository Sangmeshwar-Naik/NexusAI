"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ChartNoAxesCombined,
  FileText,
  Clock,
  HardDrive,
  Cpu,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";

type AnalyticsData = {
  summary: {
    total_documents: number;
    total_size_kb: number;
    total_words_indexed: number;
    total_characters: number;
    active_agents: number;
    agent_executions: number;
    active_workflows: number;
    workflow_runs: number;
    ai_credits_used: number;
    ai_credits_total: number;
    storage_health: string;
    average_latency_ms: number;
  };
  formats: Record<string, number>;
  activity: { day: string; queries: number; uploads: number }[];
  recent_docs: {
    id: number;
    filename: string;
    size_kb: number;
    words: number;
    created_at: string;
  }[];
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<AnalyticsData>("/analytics")
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load analytics"));
  }, []);

  const s = data?.summary;
  const maxQueries = data ? Math.max(...data.activity.map((a) => a.queries), 1) : 1;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-wrap">
      <div className="page-heading">
        <div>
          <span className="section-kicker">TELEMETRY & INSIGHTS</span>
          <h1>Analytics</h1>
          <p>Real-time knowledge ingestion volume, retrieval query throughput, and compute utilization.</p>
        </div>
      </div>

      {error && <div className="notice error">{error}</div>}

      {/* Top Stat Grid */}
      <div className="stat-grid">
        <motion.div whileHover={{ y: -4 }} className="stat-card">
          <div className="stat-icon violet">
            <FileText size={18} />
          </div>
          <span>Indexed Library</span>
          <strong>{s ? s.total_documents : "—"} files</strong>
          <small>{s ? `${s.total_size_kb} KB stored` : "Loading..."}</small>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="stat-card">
          <div className="stat-icon blue">
            <Sparkles size={18} />
          </div>
          <span>Total Words Indexed</span>
          <strong>{s ? s.total_words_indexed.toLocaleString() : "—"}</strong>
          <small>Extracted & vectorized</small>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="stat-card">
          <div className="stat-icon green">
            <Cpu size={18} />
          </div>
          <span>Agent Executions</span>
          <strong>{s ? s.agent_executions : "—"} runs</strong>
          <small>{s ? `${s.active_agents} active agents` : ""}</small>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="stat-card">
          <div className="stat-icon amber">
            <Clock size={18} />
          </div>
          <span>Average Latency</span>
          <strong>{s ? `${s.average_latency_ms} ms` : "—"}</strong>
          <small>Sub-second response</small>
        </motion.div>
      </div>

      <div className="dashboard-columns">
        {/* Left: Activity Chart */}
        <section className="panel" style={{ padding: "1.5rem" }}>
          <div className="panel-heading">
            <div>
              <h3>Weekly Knowledge Throughput</h3>
              <p>Queries and document ingestion over the past 7 days</p>
            </div>
            <TrendingUp size={18} style={{ color: "#10b981" }} />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              height: "180px",
              paddingTop: "2rem",
              gap: "0.5rem",
            }}
          >
            {data?.activity.map((act) => {
              const heightPct = Math.round((act.queries / maxQueries) * 100);
              return (
                <div
                  key={act.day}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                    height: "100%",
                    justifyContent: "flex-end",
                    gap: "0.5rem",
                  }}
                >
                  <small style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{act.queries}</small>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "28px",
                      height: `${heightPct}%`,
                      minHeight: "10px",
                      background: "linear-gradient(180deg, #6366f1 0%, #3b82f6 100%)",
                      borderRadius: "4px 4px 0 0",
                    }}
                  />
                  <small style={{ fontSize: "0.75rem", color: "#64748b" }}>{act.day}</small>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right: Format Breakdown */}
        <section className="panel" style={{ padding: "1.5rem" }}>
          <div className="panel-heading">
            <div>
              <h3>File Types Breakdown</h3>
              <p>Formats indexed in your personal vault</p>
            </div>
            <HardDrive size={18} style={{ color: "var(--accent, #6366f1)" }} />
          </div>

          {data && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              {Object.entries(data.formats).map(([fmt, count]) => {
                const total = s?.total_documents || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={fmt}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.3rem" }}>
                      <span><b>{fmt}</b> Documents</span>
                      <span style={{ color: "#94a3b8" }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          background: fmt === "PDF" ? "#ec4899" : fmt === "DOCX" ? "#3b82f6" : "#10b981",
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontSize: "0.8rem",
                  color: "#94a3b8",
                }}
              >
                Storage Engine: <b style={{ color: "#cbd5e1" }}>{s?.storage_health}</b>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Processed Files Table */}
      <section className="panel" style={{ marginTop: "1.5rem", padding: "1.5rem" }}>
        <div className="panel-heading">
          <div>
            <h3>Document Metrics</h3>
            <p>Word density and storage per file</p>
          </div>
        </div>

        {data?.recent_docs && data.recent_docs.length > 0 ? (
          <div className="document-list" style={{ marginTop: "0.5rem" }}>
            {data.recent_docs.map((doc) => (
              <div className="document-row" key={doc.id}>
                <div className="document-icon">
                  <FileText size={18} />
                </div>
                <div className="document-info">
                  <b>{doc.filename}</b>
                  <small>
                    {doc.words.toLocaleString()} words · {doc.size_kb} KB
                  </small>
                </div>
                <span className="status-pill">
                  <i /> Processed
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-activity">
            <strong>No files to analyze</strong>
            <span>Upload documents in the Documents section to generate telemetry.</span>
          </div>
        )}
      </section>
    </motion.div>
  );
}
