"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserServiceUrl, setAuthTokenCookie } from "@/lib/authClient";
export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setTimeout(() => router.replace("/signin?error=google_failed"), 2000);
      return;
    }

    const finalize = async () => {
      try {
        // 1. Persist token
        setAuthTokenCookie(token);
        localStorage.setItem("auth", token);

        // 2. Fetch the full user profile so role/user are stored
        const res = await fetch(`${getUserServiceUrl()}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const profile = await res.json();
          localStorage.setItem("user", JSON.stringify(profile));
          localStorage.setItem("role", profile.role ?? "USER");
        }

        // 3. Redirect to dashboard
        router.replace("/");
      } catch {
        setStatus("error");
        setTimeout(() => router.replace("/signin?error=google_failed"), 2000);
      }
    };

    finalize();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center space-y-3">
        {status === "loading" ? (
          <>
            {/* Spinner */}
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Signing you in…
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-red-500">
              Google sign-in failed.
            </p>
            <p className="text-xs text-gray-400">Redirecting you back…</p>
          </>
        )}
      </div>
    </div>
  );
}