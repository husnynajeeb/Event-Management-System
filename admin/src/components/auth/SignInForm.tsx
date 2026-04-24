"use client";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";
import { getUserServiceUrl, setAuthTokenCookie } from "@/lib/authClient";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show error message if redirected back from a failed Google login
  useEffect(() => {
    if (searchParams.get("error") === "google_failed") {
      setError("Google sign-in failed. Please try again.");
    }
  }, [searchParams]);

  // ✅ FIX: Google button does a full-page redirect — NOT fetch/axios.
  // The callback is now handled by /auth/callback/page.tsx, NOT here.
  const handleGoogleLogin = () => {
    window.location.href = `${getUserServiceUrl()}/auth/google`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${getUserServiceUrl()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Show the actual server message (e.g. "Invalid credentials")
        setError(data.message || "Login failed. Please check your credentials.");
        return;
      }

      if (!data.accessToken) {
        setError("No token returned from server.");
        return;
      }

      // Persist session
      setAuthTokenCookie(data.accessToken);
      localStorage.setItem("auth", data.accessToken);
      localStorage.setItem("role", data.user?.role ?? "USER");
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>

          <div>
            {/* GOOGLE LOGIN */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
              <button
                onClick={handleGoogleLogin}
                type="button"
                className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
              >
                {/* Google SVG icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>

            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                  Or
                </span>
              </div>
            </div>

            {/* EMAIL LOGIN */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="info@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer z-10"
                    >
                      {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="remember"
                      checked={isChecked}
                      onChange={setIsChecked}
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm text-gray-500 cursor-pointer"
                    >
                      Keep me logged in
                    </label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-brand-500 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                {error && (
                  <p className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">
                    {error}
                  </p>
                )}

                <Button className="w-full" disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Signing in…" : "Sign in"}
                </Button>

                <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="text-brand-500 hover:underline font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}