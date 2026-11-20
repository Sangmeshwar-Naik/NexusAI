"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  FileText,
  Tag,
  ArrowRight,
  FolderOpen,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

type KnowledgeOverview = {
  total_documents: number;
  topics: { term: string; frequency: number }[];
  collections: { name: string; count: number; color: string }[];
  documents: {
    id: number;
    filename: string;
    preview: string;
    characters: number;
    created_at: string;
  }[];
};

type SearchResult = {
  query: string;
  total_matches: number;
  matching_documents: {
    document_id: number;
    filename: string;
    match_count: number;
    excerpts: { line_number: number; snippet: string }[];
  }[];
};

export default function KnowledgePage() {
  const [data, setData] = useState<KnowledgeOverview | null>(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<KnowledgeOverview>("/knowledge")
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load knowledge base"));
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || query.length < 2) return;
    setSearching(true);
    setError("");
    try {
      const res = await api<SearchResult>(`/knowledge/search?q=${encodeURIComponent(query)}`);
      setSearchResults(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  }

  function clearSearch() {
    setQuery("");
    setSearchResults(null);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-wrap">
      <div className="page-heading">
        <div>
          <span className="section-kicker">STRUCTURED RETRIEVAL LAYER</span>
          <h1>Knowledge Base</h1>
          <p>Explore indexed topics, categorized collections, and perform full-text snippet search across your entire vault.</p>
        </div>
        <Link href="/documents" className="button button-primary">
          <FolderOpen size={16} /> Manage documents
        </Link>
      </div>

      {error && <div className="notice error">{error}</div>}

      {/* Global Knowledge Search Bar */}
      <form onSubmit={handleSearch} style={{ margin: "1rem 0 1.5rem 0" }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Search size={18} style={{ position: "absolute", left: "14px", color: "#94a3b8" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all document text for keywords, clauses, revenue, dates..."
            style={{
              width: "100%",
              padding: "0.85rem 1rem 0.85rem 2.75rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "10px",
              color: "inherit",
              fontSize: "0.95rem",
            }}
          />
          <button
            type="submit"
            className="button button-primary small"
            style={{ position: "absolute", right: "8px" }}
            disabled={searching || !query.trim()}
          >
            {searching ? "Searching..." : "Search Vault"}
          </button>
        </div>
      </form>

      {/* Search Results Display */}
      {searchResults && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel"
          style={{ marginBottom: "1.5rem", padding: "1.25rem", border: "1px solid var(--accent, #6366f1)" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h3 style={{ margin: 0, fontSize: "1rem" }}>
              Found {searchResults.total_matches} match(es) in {searchResults.matching_documents.length} document(s) for &quot;{searchResults.query}&quot;
            </h3>
            <button className="button small button-ghost" onClick={clearSearch}>
              Clear Search
            </button>
          </div>

          {searchResults.matching_documents.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {searchResults.matching_documents.map((m) => (
                <div key={m.document_id} style={{ padding: "0.75rem", borderRadius: "6px", background: "rgba(0,0,0,0.25)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
                    <FileText size={15} style={{ color: "var(--accent, #6366f1)" }} />
                    <b>{m.filename}</b>
                    <small style={{ color: "#94a3b8" }}>({m.match_count} occurrences)</small>
                  </div>
                  {m.excerpts.map((ex, i) => (
                    <div key={i} style={{ fontSize: "0.82rem", color: "#cbd5e1", marginLeft: "1.4rem", padding: "2px 0" }}>
                      <span style={{ color: "#64748b", marginRight: "6px" }}>Line {ex.line_number}:</span>
                      &quot;{ex.snippet}&quot;
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>No matching passages found. Try a different query.</div>
          )}
        </motion.div>
      )}

      {/* Collections Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {data?.collections.map((col) => (
          <div key={col.name} className="panel" style={{ padding: "1.25rem" }}>
            <div className={`stat-icon ${col.color}`} style={{ width: "36px", height: "36px", borderRadius: "8px", marginBottom: "0.75rem" }}>
              <FolderOpen size={18} />
            </div>
            <h3 style={{ margin: 0, fontSize: "0.95rem" }}>{col.name}</h3>
            <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{col.count} document{col.count === 1 ? "" : "s"} indexed</span>
          </div>
        ))}
      </div>

      <div className="dashboard-columns">
        {/* Left: Top Topics Cloud */}
        <section className="panel" style={{ padding: "1.5rem" }}>
          <div className="panel-heading">
            <div>
              <h3>Extracted Key Terms</h3>
              <p>Prominent entities and vocabulary identified in your library</p>
            </div>
            <Tag size={18} style={{ color: "#3b82f6" }} />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }}>
            {data?.topics && data.topics.length > 0 ? (
              data.topics.map((t) => (
                <button
                  key={t.term}
                  onClick={() => {
                    setQuery(t.term);
                    api<SearchResult>(`/knowledge/search?q=${encodeURIComponent(t.term)}`).then(setSearchResults);
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "16px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "inherit",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <span>{t.term}</span>
                  <small style={{ color: "#94a3b8" }}>{t.frequency}</small>
                </button>
              ))
            ) : (
              <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Upload documents to generate topical entity clouds.</div>
            )}
          </div>
        </section>

        {/* Right: Document Content Previews */}
        <section className="panel" style={{ padding: "1.5rem" }}>
          <div className="panel-heading">
            <div>
              <h3>Indexed Content Vault</h3>
              <p>Direct excerpt verification</p>
            </div>
            <Sparkles size={18} style={{ color: "#ec4899" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
            {data?.documents && data.documents.length > 0 ? (
              data.documents.slice(0, 4).map((d) => (
                <div
                  key={d.id}
                  style={{
                    padding: "0.85rem",
                    borderRadius: "6px",
                    background: "rgba(0,0,0,0.2)",
                    fontSize: "0.82rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                    <b>{d.filename}</b>
                    <small style={{ color: "#94a3b8" }}>{d.characters.toLocaleString()} chars</small>
                  </div>
                  <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.5 }}>
                    &quot;{d.preview}...&quot;
                  </p>
                </div>
              ))
            ) : (
              <div className="empty-activity">
                <strong>Knowledge layer empty</strong>
                <span>Upload a document to start building your knowledge base.</span>
                <Link href="/documents">Upload your first document <ArrowRight size={14} /></Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
