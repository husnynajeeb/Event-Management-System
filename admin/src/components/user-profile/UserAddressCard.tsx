"use client";
import React from "react";
import type { UserProfile } from "./UserMetaCard";

interface UserAddressCardProps {
  user?: UserProfile | null;
  loading?: boolean;
}

export default function UserAddressCard({ user, loading }: UserAddressCardProps) {
  if (loading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 animate-pulse">
        <div className="h-4 w-24 mb-3 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-3 w-32 mb-2 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-3">
        Address
      </h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
        Primary address
      </p>
      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
        {user?.address || "Address not set"}
      </p>
    </div>
  );
}
