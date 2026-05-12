"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { authService } from "@/services/auth.service";
import { useAppStore } from "@/store/app.store";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();

  const setTokens = useAppStore((s) => s.setTokens);
  const hydrate = useAppStore((s) => s.hydrate);
  const setBusinessId = useAppStore((s) => s.setBusinessId);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to manage your businesses and finances."
      footer={
        <>
          New here?{" "}
          <Link className="text-primary underline underline-offset-4" href="/register">
            Create an account
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setLoading(true);
          try {
            const res = await authService.login({ email, password });
            useAppStore.setState({ user: res.user });
            setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
            // Reset business selection; selector will choose the first available.
            useAppStore.setState({ businessId: null });
            toast.push({ kind: "success", title: "Signed in" });
            router.replace("/dashboard");
          } catch (err) {
            setError("Invalid email or password");
            toast.push({ kind: "error", title: "Sign in failed", message: "Check your credentials." });
          } finally {
            setLoading(false);
          }
        }}
      >
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        {error ? <div className="text-sm text-danger">{error}</div> : null}

        <Button type="submit" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>
    </AuthCard>
  );
}

