import { useState } from "react";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [me, setMe] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // LOGIN
  async function login() {
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setToken(data.session.access_token);
  }

  // CALL PROTECTED
  async function getMe() {
    if (!token) return;

    const res = await fetch("/api/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setMe(data);
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Bun + Supabase Auth Test</h1>

      {!token && (
        <>
          <input
            placeholder="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <br />

          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <br />

          <button onClick={login}>Login</button>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </>
      )}

      {token && (
        <>
          <p>Logged in</p>
          <button onClick={getMe}>Call /api/me</button>

          {me && (
            <pre>{JSON.stringify(me, null, 2)}</pre>
          )}
        </>
      )}
    </div>
  );
}
