"use client";
import React from "react";
import AvatarUpload from "./AvatarUpload";

export type UserProfile = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
  phone?: string | null;
  address?: string | null;
  imageUrl?: string | null;
  role?: string;
};

interface UserMetaCardProps {
  user?: UserProfile | null;
  onAvatarChange?: (url: string) => void;
  loading?: boolean;
}

export default function UserMetaCard({
  user,
  onAvatarChange,
  loading,
}: UserMetaCardProps) {
  const fullName =
    (user?.firstName || user?.lastName
      ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
      : null) || "User";

  const primaryLine = user?.role || "User";
  const secondaryLine = user?.email || "Email not set";

  if (loading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 animate-pulse">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="order-3 xl:order-2 flex-1">
              <div className="h-4 w-32 mb-3 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="flex flex-col items-center gap-2 text-center xl:flex-row xl:gap-3 xl:text-left w-full">
                <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block" />
                <div className="h-3 w-40 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <AvatarUpload
            label=""
            value={user?.imageUrl || undefined}
            onChange={(url) => onAvatarChange?.(url)}
          />
          <div className="order-3 xl:order-2">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {fullName}
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {primaryLine}
              </p>
              <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {secondaryLine}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
