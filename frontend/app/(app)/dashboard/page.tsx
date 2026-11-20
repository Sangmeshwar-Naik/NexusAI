"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  FileText,
  Sparkles,
  Clock3,
  Plus,
  ArrowRight,
  MoreHorizontal,
  UploadCloud,
  MessageSquareText,
  Search,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { getUser, api, Doc, User } from "@/lib/api";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);

  useEffect(() => {
    setUser(getUser());
    api<User>("/auth/me").then(setUser).catch(() => {});
    api<Doc[]>("/documents").then(setDocs).catch(() => {});
  }, []);

  const firstName = user?.name ? user.name.split(" ")[0] : "Member";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="page-wrap"
    >
      <div className="page-heading">
        <div>
          <span className="section-kicker">YOUR WORKSPACE IS READY</span>
          <h1>
            Good day, <span className="gradient-text">{firstName}.</span>
          </h1>
          <p>Here's what's happening across your knowledge workspace.</p>
        </div>
        <Link href="/documents" className="button button-primary">
          <Plus size={16} /> Add documents
        </Link>
      </div>

      <div className="welcome-banner">
        <div className="welcome-glow" />
        <div className="welcome-copy">
          <span className="banner-tag">
            <Sparkles size={13} /> NEXUS INTELLIGENCE
          </span>
          <h2>
            Your next insight is
            <br />
            one question away.
          </h2>
          <p>Ask across your documents and turn information into momentum.</p>
          <Link href="/workspace" className="banner-link">
            Open AI workspace <ArrowRight size={15} />
          </Link>
        </div>
        <div className="banner-orbit">
          <div className="orbit o1" />
          <div className="orbit o2" />
          <div className="orbit-core">
            <Sparkles size={27} />
          </div>
          <i className="orbit-node node1" />
          <i className="orbit-node node2" />
          <i className="orbit-node node3" />
        </div>
      </div>

      <div className="stat-grid">
        <Stat
          icon={<FileText />}
          label="Total documents"
          value={String(docs.length)}
          note={docs.length ? `${docs.length} indexed & searchable` : "Your library starts here"}
          tone="violet"
        />
        <Stat
          icon={<MessageSquareText />}
          label="AI conversations"
          value="Ready"
          note="Ask in AI workspace"
          tone="blue"
        />
        <Stat
          icon={<Clock3 />}
          label="Engine status"
          value="Active"
          note="FastAPI RAG online"
          tone="green"
        />
        <Stat
          icon={<Activity />}
          label="Workspace health"
          value="100%"
          note="All systems operational"
          tone="amber"
        />
      </div>

      <div className="dashboard-columns">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Recent documents</h3>
              <p>Your latest uploaded files</p>
            </div>
            <Link href="/documents" className="icon-button" title="View all">
              <MoreHorizontal size={18} />
            </Link>
          </div>
          {docs.length > 0 ? (
            <div className="document-list" style={{ padding: "0.5rem" }}>
              {docs.slice(0, 4).map((d) => (
                <div className="document-row" key={d.id} style={{ margin: "0.25rem 0" }}>
                  <div className="document-icon">
                    <FileText size={18} />
                  </div>
                  <div className="document-info">
                    <b>{d.filename}</b>
                    <small>
                      {(d.size_bytes / 1024).toFixed(1)} KB · Added{" "}
                      {new Date(d.created_at).toLocaleDateString()}
                    </small>
                  </div>
                  <span className="status-pill">
                    <i /> Indexed
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-activity">
              <div className="empty-icon">
                <FileText size={20} />
              </div>
              <strong>Your activity will appear here</strong>
              <span>Upload a document to start building your knowledge base.</span>
              <Link href="/documents">
                Upload your first document <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </section>

        <section className="panel quick-panel">
          <div className="panel-heading">
            <div>
              <h3>Quick actions</h3>
              <p>Pick up where you want to begin</p>
            </div>
          </div>
          <Quick
            icon={<UploadCloud />}
            title="Upload documents"
            desc="PDF, DOCX and TXT"
            href="/documents"
          />
          <Quick
            icon={<Sparkles />}
            title="Ask Nexus AI"
            desc="Get answers with sources"
            href="/workspace"
          />
          <Quick
            icon={<Search />}
            title="Explore knowledge"
            desc="Search your indexed content"
            href="/knowledge"
          />
        </section>
      </div>

      <div className="bottom-note">
        <span>
          <Sparkles size={14} /> Your workspace is private to your account ({user?.email || "signed in"}).
        </span>
        <span>
          Need a hand? <a href="mailto:support@nexusai.local">Contact support</a>
        </span>
      </div>
    </motion.div>
  );
}

function Stat({
  icon,
  label,
  value,
  note,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
  tone: string;
}) {
  return (
    <motion.div whileHover={{ y: -4 }} className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </motion.div>
  );
}

function Quick({
  icon,
  title,
  desc,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link href={href} className="quick-action">
      <span className="quick-icon">{icon}</span>
      <span>
        <b>{title}</b>
        <small>{desc}</small>
      </span>
      <ArrowUpRight size={16} />
    </Link>
  );
}
