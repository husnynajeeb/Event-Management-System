"use client";

import React, { useEffect, useState } from "react";
import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard, {
  type UserProfile,
} from "@/components/user-profile/UserMetaCard";
import ChangePasswordCard from "@/components/profile/ChangePasswordCard";
import { getAuthTokenFromCookie, getUserServiceUrl } from "@/lib/authClient";

export default function ProfileClient() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const token = getAuthTokenFromCookie();
        if (!token) {
          setError("You are not signed in.");
          setLoading(false);
          return;
        }

        const baseUrl = getUserServiceUrl();
        const res = await fetch(`${baseUrl}/auth/validate`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(data.message || "Unable to load profile.");
          setLoading(false);
          return;
        }

        setUser(data.user as UserProfile);
        setLoading(false);
      } catch {
        setError("Something went wrong while loading your profile.");
        setLoading(false);
      }
    }

    void fetchCurrentUser();
  }, []);

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-4">
          Profile
        </h3>

        {error && !loading && (
          <p className="mb-4 text-sm text-error-500">{error}</p>
        )}

        <div className="space-y-6">
          <UserMetaCard
            user={user}
            loading={loading}
            onAvatarChange={(url) =>
              setUser((prev) => (prev ? { ...prev, imageUrl: url } : prev))
            }
          />
          <UserInfoCard
            user={user}
            loading={loading}
            onUserUpdated={(updated) => setUser(updated)}
          />
          <UserAddressCard user={user} loading={loading} />
          <ChangePasswordCard />
        </div>
      </div>
    </div>
  );
}

