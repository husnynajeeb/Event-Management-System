"use client";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import React, { FormEvent, useState } from "react";
import {
  getAuthTokenFromCookie,
  getUserServiceUrl,
} from "@/lib/authClient";

export default function ChangePasswordCard() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const token = getAuthTokenFromCookie();
      if (!token) {
        setError("You must be signed in to change your password.");
        setIsSubmitting(false);
        return;
      }

      const baseUrl = getUserServiceUrl();
      const res = await fetch(`${baseUrl}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Unable to change password. Please try again.");
        return;
      }

      setMessage(data.message || "Password changed successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Something went wrong. Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
        Change password
      </h4>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
        <div>
          <Label>
            Current password <span className="text-error-500">*</span>{" "}
          </Label>
          <Input
            type="password"
            placeholder="Enter current password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <Label>
            New password <span className="text-error-500">*</span>{" "}
          </Label>
          <Input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <Label>
            Confirm new password <span className="text-error-500">*</span>{" "}
          </Label>
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
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

        <Button size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
}

