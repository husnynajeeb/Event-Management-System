 "use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import React, { FormEvent, useState } from "react";
import { getUserServiceUrl } from "@/lib/authClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
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
      const res = await fetch(`${baseUrl}/auth/forget-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          data.message || "Unable to start password reset. Please try again.",
        );
        return;
      }

      setMessage(
        data.message ||
          "If an account exists, you will receive an email with reset instructions.",
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
              Forgot password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email to receive a one-time code to reset your
              password.
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
                  {isSubmitting ? "Sending..." : "Send reset code"}
                </Button>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Already have a code?{" "}
                <Link
                  href="/reset-password"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Reset password
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

