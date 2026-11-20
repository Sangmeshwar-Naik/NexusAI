export type User = { id: number; name: string; email: string };
export type Doc = { id: number; filename: string; size_bytes: number; created_at: string };

export function getApiUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
      return envUrl.replace("localhost", hostname).replace("127.0.0.1", hostname);
    }
  }
  return envUrl;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("nexus_token");
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("nexus_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(token: string, user?: User) {
  if (typeof window === "undefined") return;
  localStorage.setItem("nexus_token", token);
  if (user) {
    localStorage.setItem("nexus_user", JSON.stringify(user));
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("nexus_token");
  localStorage.removeItem("nexus_user");
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const baseUrl = getApiUrl();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, { ...options, headers, cache: "no-store" });
  } catch (err) {
    throw new Error(
      `Unable to connect to backend at ${baseUrl}. Please ensure the backend is running.`
    );
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined" && !path.startsWith("/auth/")) {
      clearSession();
      window.location.href = "/login";
    }
    throw new Error(data.detail || `Request failed (${response.status})`);
  }

  return data as T;
}
