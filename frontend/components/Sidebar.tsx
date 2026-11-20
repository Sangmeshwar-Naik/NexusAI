"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  BookOpen,
  Bot,
  Boxes,
  ChartNoAxesCombined,
  Command,
  FileText,
  LayoutDashboard,
  Plug,
  Settings,
  Workflow,
  LogOut,
} from "lucide-react";
import { User } from "@/lib/api";

const nav = [
  {
    label: "Workspace",
    items: [
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { name: "AI Workspace", href: "/workspace", icon: Bot },
      { name: "Documents", href: "/documents", icon: FileText },
      { name: "Knowledge base", href: "/knowledge", icon: BookOpen },
    ],
  },
  {
    label: "Build",
    items: [
      { name: "AI Agents", href: "/agents", icon: Boxes },
      { name: "Workflows", href: "/workflows", icon: Workflow },
      { name: "Integrations", href: "/integrations", icon: Plug },
    ],
  },
  {
    label: "Manage",
    items: [
      { name: "Analytics", href: "/analytics", icon: ChartNoAxesCombined },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export default function Sidebar({
  user,
  onLogout,
}: {
  user?: User | null;
  onLogout?: () => void;
}) {
  const path = usePathname();
  const displayName = user?.name || "Workspace Member";
  const displayEmail = user?.email || "Signed in";
  const initial = (user?.name?.[0] || "U").toUpperCase();

  return (
    <aside className="sidebar">
      <Link href="/dashboard" className="brand">
        <span className="brand-mark">
          <Command size={19} />
        </span>
        <span>
          Nexus<span className="brand-light">AI</span>
        </span>
        <span className="brand-beta">BETA</span>
      </Link>
      <div className="workspace-switch">
        <div className="workspace-avatar">N</div>
        <div>
          <strong>Nexus workspace</strong>
          <small>Free plan</small>
        </div>
        <span className="chevron">⌄</span>
      </div>
      {nav.map((group) => (
        <div className="nav-group" key={group.label}>
          <p className="nav-label">{group.label}</p>
          {group.items.map((item) => {
            const Icon = item.icon;
            const active = path === item.href;
            return (
              <Link
                href={item.href}
                key={item.href}
                className={`nav-link ${active ? "active" : ""}`}
              >
                <Icon size={17} />
                <span>{item.name}</span>
                {active && (
                  <motion.i layoutId="nav-active" className="active-indicator" />
                )}
              </Link>
            );
          })}
        </div>
      ))}
      <div className="sidebar-bottom">
        <div className="usage-card">
          <div className="usage-head">
            <span>AI usage</span>
            <span>68%</span>
          </div>
          <div className="usage-track">
            <i />
          </div>
          <small>6,820 / 10,000 credits</small>
          <button>
            Upgrade plan <span>↗</span>
          </button>
        </div>
        <div
          className="profile-row"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              overflow: "hidden",
            }}
          >
            <div className="profile-avatar">{initial}</div>
            <div style={{ overflow: "hidden" }}>
              <strong
                style={{
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  display: "block",
                }}
              >
                {displayName}
              </strong>
              <small
                style={{
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  display: "block",
                }}
              >
                {displayEmail}
              </small>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign out"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--foreground-muted, #94a3b8)",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
