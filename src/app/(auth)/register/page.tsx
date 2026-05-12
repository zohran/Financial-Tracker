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

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const setTokens = useAppStore((s) => s.setTokens);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start tracking income and expenses across multiple businesses."
      footer={
        <>
          Already have an account?{" "}
          <Link className="text-primary underline underline-offset-4" href="/login">
            Sign in
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
            const res = await authService.register({ email, password });
            useAppStore.setState({ user: res.user, businessId: null });
            setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
            toast.push({ kind: "success", title: "Account created" });
            router.replace("/dashboard");
          } catch (err) {
            setError("Could not create account. Try another email.");
            toast.push({ kind: "error", title: "Registration failed" });
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min 8 characters"
          hint="Use at least 8 characters."
        />

        {error ? <div className="text-sm text-danger">{error}</div> : null}

        <Button type="submit" className="w-full" loading={loading}>
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}

