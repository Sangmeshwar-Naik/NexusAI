"use client";

import Sidebar from "./Sidebar";
import { Bell, Search, Menu, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getToken, getUser, clearSession, api, User } from "@/lib/api";

const titles: Record<string, string> = {
  "/dashboard": "Overview",
  "/workspace": "AI Workspace",
  "/documents": "Documents",
  "/knowledge": "Knowledge base",
  "/agents": "AI Agents",
  "/workflows": "Workflows",
  "/integrations": "Integrations",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    const cached = getUser();
    if (cached) setCurrentUser(cached);
    api<User>("/auth/me")
      .then((u) => {
        setCurrentUser(u);
        localStorage.setItem("nexus_user", JSON.stringify(u));
      })
      .catch(() => {
        // Handled in api()
      });
  }, [router]);

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  const initial = currentUser?.name?.[0]?.toUpperCase() || "U";

  return (
    <div className="app-layout">
      <div className={open ? "mobile-sidebar show" : "mobile-sidebar"}>
        <Sidebar user={currentUser} onLogout={handleLogout} />
      </div>
      <div className="desktop-sidebar">
        <Sidebar user={currentUser} onLogout={handleLogout} />
      </div>
      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            onClick={() => setOpen(!open)}
            aria-label="Open menu"
          >
            <Menu size={19} />
          </button>
          <div className="breadcrumbs">
            <span>Workspace</span>
            <b>/</b>
            <strong>{titles[path] || "Overview"}</strong>
          </div>
          <div className="top-actions">
            <button className="search-trigger">
              <Search size={15} /> <span>Search anything...</span>
              <kbd>⌘ K</kbd>
            </button>
            <button className="icon-button" aria-label="Notifications">
              <Bell size={18} />
              <i className="notification-dot" />
            </button>
            <div
              className="top-avatar"
              title={currentUser?.email || "User profile"}
            >
              {initial}
            </div>
            <button
              className="icon-button"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
              style={{ color: "var(--foreground-muted, #94a3b8)" }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
