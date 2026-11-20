"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { api, saveSession, User } from "@/lib/api";
import AuthFrame from "@/components/AuthFrame";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const d = await api<{ access_token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      saveSession(d.access_token, d.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  function fillDemo() {
    setEmail("admin@nexusai.com");
    setPassword("password123");
    setError("");
  }

  return (
    <AuthFrame title="Welcome back" subtitle="Sign in to your intelligence workspace">
      <form onSubmit={submit} className="auth-form">
        <label>
          Email address
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </label>
        <label>
          Password
          <div className="password-wrap">
            <input
              type={show ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <button type="button" onClick={() => setShow(!show)} aria-label="Toggle password visibility">
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="button button-primary auth-submit" disabled={busy}>
          {busy ? "Signing in..." : "Sign in"} <ArrowRight size={16} />
        </button>
      </form>
      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <button
          type="button"
          onClick={fillDemo}
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "6px",
            color: "var(--foreground-muted, #94a3b8)",
            padding: "6px 12px",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          ✦ Fill Default Admin Credentials
        </button>
      </div>
      <p className="auth-switch">
        New to NexusAI? <Link href="/register">Create an account</Link>
      </p>
    </AuthFrame>
  );
}
