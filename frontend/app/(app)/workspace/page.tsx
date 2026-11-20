"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, FileText, Plus, UserRound } from "lucide-react";
import { api } from "@/lib/api";

type Msg = {
  role: "assistant" | "user";
  text: string;
  sources?: { filename: string; relevance: number }[];
};

interface ChatResponse {
  answer: string;
  sources: { filename: string; relevance: number }[];
  mode: string;
}

export default function Workspace() {
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [error, setError] = useState("");

  async function ask(q = question) {
    if (!q.trim() || busy) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setQuestion("");
    setBusy(true);
    setError("");
    try {
      const r = await api<ChatResponse>("/chat", {
        method: "POST",
        body: JSON.stringify({ question: q }),
      });
      setMessages((m) => [
        ...m,
        { role: "assistant", text: r.answer, sources: r.sources },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not get an answer");
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="workspace-page"
    >
      <div className="workspace-heading">
        <div>
          <span className="section-kicker">YOUR KNOWLEDGE, ON DEMAND</span>
          <h1>AI Workspace</h1>
          <p>Ask questions across your uploaded documents.</p>
        </div>
        <button
          className="icon-button"
          onClick={() => setMessages([])}
          title="New conversation"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="chat-stage">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-orb">
              <div>
                <Sparkles size={30} />
              </div>
              <i />
              <b />
            </div>
            <span className="section-kicker">NEXUS AI ASSISTANT</span>
            <h2>
              What would you like
              <br />
              to <span className="gradient-text">understand?</span>
            </h2>
            <p>Your documents are the context. Your curiosity is the prompt.</p>
            <div className="prompt-grid">
              {[
                "Summarize my uploaded documents",
                "What are the key risks mentioned?",
                "Compare the main themes across files",
                "Find important dates and decisions",
              ].map((q) => (
                <button key={q} onClick={() => ask(q)}>
                  {q}
                  <span>↗</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="message-list">
            {messages.map((m, i) => (
              <div className={`message ${m.role}`} key={i}>
                <div className="message-avatar">
                  {m.role === "assistant" ? (
                    <Sparkles size={16} />
                  ) : (
                    <UserRound size={16} />
                  )}
                </div>
                <div className="message-body">
                  <small>{m.role === "assistant" ? "NEXUS AI" : "YOU"}</small>
                  <p>{m.text}</p>
                  {m.sources && m.sources.length > 0 && (
                    <div className="source-list">
                      <span>REFERENCED SOURCES</span>
                      {m.sources.map((s, j) => (
                        <div key={j}>
                          <FileText size={13} />
                          {s.filename}
                          <small>{Math.round(s.relevance * 100)}% match</small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="message assistant">
                <div className="message-avatar">
                  <Sparkles size={16} />
                </div>
                <div className="typing">
                  <i />
                  <i />
                  <i /> <span>Searching your knowledge...</span>
                </div>
              </div>
            )}
          </div>
        )}
        {error && <div className="notice error">{error}</div>}
      </div>

      <form
        className="chat-composer"
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
      >
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              ask();
            }
          }}
          placeholder="Ask anything about your documents..."
          rows={2}
        />
        <div className="composer-footer">
          <span>
            <Sparkles size={13} /> Answers grounded in your library
          </span>
          <button
            className="send-button"
            disabled={!question.trim() || busy}
          >
            <Send size={16} />
          </button>
        </div>
      </form>
      <div className="chat-disclaimer">
        AI can make mistakes. Verify important information against the cited
        source documents.
      </div>
    </motion.div>
  );
}
