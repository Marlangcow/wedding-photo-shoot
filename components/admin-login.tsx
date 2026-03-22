"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expected =
      process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "admin";
    if (password === expected) {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Lock className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Admin Access</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the password to continue
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={`w-full rounded-[var(--radius)] border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent ${
                error ? "border-destructive" : "border-input"
              }`}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-xs text-destructive">
                Incorrect password. Try again.
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full rounded-[var(--radius)] bg-primary py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
