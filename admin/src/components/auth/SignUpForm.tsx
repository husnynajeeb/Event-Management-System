"use client";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState, FormEvent } from "react";
import { getUserServiceUrl, setAuthTokenCookie } from "@/lib/authClient";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    imageFile: null as File | null,
  });

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ✅ FIX: Google button does a full-page redirect — same as SignInForm.
  // After Google, user lands on /auth/callback which handles token storage.
  const handleGoogleSignUp = () => {
    window.location.href = `${getUserServiceUrl()}/auth/google`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isChecked) {
      setError("You must accept the terms and conditions.");
      return;
    }

    setIsSubmitting(true);

    try {
      const baseUrl = getUserServiceUrl();

      // ✅ FIX: Backend uses @Body() dto: RegisterDto which expects JSON.
      // FormData was silently failing — all fields arrived as undefined.
      // Step 1: Register with JSON
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          address: form.address,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // 409 = duplicate email, 400 = validation error
        setError(data.message || "Registration failed. Please try again.");
        return;
      }

      if (!data.accessToken) {
        setError("No token returned from server.");
        return;
      }

      // Persist session immediately
      setAuthTokenCookie(data.accessToken);
      localStorage.setItem("auth", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user?.role ?? "USER");

      // ✅ Step 2: Upload avatar separately if the user selected one.
      // The backend has a dedicated PATCH /users/me/avatar → Cloudinary route.
      if (form.imageFile) {
        const avatarForm = new FormData();
        avatarForm.append("avatar", form.imageFile);

        await fetch(`${baseUrl}/users/me/avatar`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${data.accessToken}` },
          body: avatarForm,
          // NOTE: Do NOT set Content-Type — browser sets it with the boundary
        });
        // Non-fatal: if avatar upload fails, user is still registered
      }

      window.location.href = "/";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Sign Up
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create your account to get started!
          </p>
        </div>

        {/* GOOGLE SIGN UP */}
        <button
          onClick={handleGoogleSignUp}
          type="button"
          className="inline-flex items-center justify-center gap-3 py-3 mb-6 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
        >
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
          Sign up with Google
        </button>

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

        {/* EMAIL SIGN UP */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="John"
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label>
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                placeholder="+1 234 567 8900"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>

            <div>
              <Label>Address</Label>
              <Input
                placeholder="123 Main St, City"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>

            {/* PROFILE PICTURE — uploaded after registration via /users/me/avatar */}
            <div>
              <Label>Profile Picture</Label>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-white/5 dark:file:text-white/70"
                onChange={(e) =>
                  handleChange("imageFile", e.target.files?.[0] ?? null)
                }
              />
            </div>

            {/* PASSWORD */}
            <div>
              <Label>
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
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

            {/* TERMS */}
            <div className="flex items-center gap-3">
              <Checkbox
                id="terms"
                checked={isChecked}
                onChange={setIsChecked}
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer"
              >
                I agree to the{" "}
                <Link href="/terms" className="text-brand-500 hover:underline">
                  Terms & Conditions
                </Link>
              </label>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? "Creating account…" : "Sign Up"}
            </button>

            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-brand-500 hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}