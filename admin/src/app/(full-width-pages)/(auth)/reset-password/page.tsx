 "use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import React, { FormEvent, useState } from "react";
import { getUserServiceUrl } from "@/lib/authClient";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const baseUrl = getUserServiceUrl();
      const res = await fetch(`${baseUrl}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Unable to reset password. Please try again.");
        return;
      }

      setMessage(
        data.message ||
          "Password reset successfully. You can now sign in with your new password.",
      );
    } catch {
      setError("Something went wrong. Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Reset password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter the code you received by email and choose a new password.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label>
                  Email <span className="text-error-500">*</span>{" "}
                </Label>
                <Input
                  placeholder="info@gmail.com"
                  type="email"
                  defaultValue={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label>
                  One-time code (OTP){" "}
                  <span className="text-error-500">*</span>{" "}
                </Label>
                <Input
                  placeholder="Enter 6-digit code"
                  type="text"
                  defaultValue={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              <div>
                <Label>
                  New password <span className="text-error-500">*</span>{" "}
                </Label>
                <Input
                  placeholder="Enter new password"
                  type="password"
                  defaultValue={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              {message && (
                <p className="text-sm text-success-600 dark:text-success-500">
                  {message}
                </p>
              )}

              {error && (
                <p className="text-sm text-error-500">
                  {error}
                </p>
              )}

              <div>
                <Button className="w-full" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Resetting..." : "Reset password"}
                </Button>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Remembered your password?{" "}
                <Link
                  href="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Back to sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

