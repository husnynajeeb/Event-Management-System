"use client";

import React, { useEffect, useState } from "react";
import { getAuthTokenFromCookie, getUserServiceUrl } from "@/lib/authClient";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Image from "next/image";

type AppUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  avatarUrl?: string | null;
};

type UsersResponse = {
  items: AppUser[];
  total: number;
  page: number;
  limit: number;
};

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {["User", "Email", "Status", "Created", "Action"].map((label) => (
                  <TableCell
                    key={label}
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {Array.from({ length: rows }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse dark:bg-white/10" />
                      <div className="space-y-2">
                        <div className="h-4 w-24 rounded bg-gray-200 animate-pulse dark:bg-white/10" />
                        <div className="h-3 w-32 rounded bg-gray-200 animate-pulse dark:bg-white/10" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="h-4 w-36 rounded bg-gray-200 animate-pulse dark:bg-white/10" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="h-6 w-14 rounded-full bg-gray-200 animate-pulse dark:bg-white/10" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="h-4 w-20 rounded bg-gray-200 animate-pulse dark:bg-white/10" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="h-7 w-20 rounded-lg bg-gray-200 animate-pulse dark:bg-white/10" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default function AppUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const token = getAuthTokenFromCookie();
        if (!token) {
          setError("You are not signed in.");
          setLoading(false);
          return;
        }
        const baseUrl = getUserServiceUrl();
        const res = await fetch(
          `${baseUrl}/users?page=${page}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = (await res.json().catch(() => ({}))) as Partial<UsersResponse>;
        if (!res.ok) {
          setError(
            (data as { message?: string })?.message || "Unable to load users. Admin only route.",
          );
          setLoading(false);
          return;
        }
        setUsers(data.items || []);
        setTotal(data.total || 0);
        setLoading(false);
      } catch {
        setError("Something went wrong while loading users.");
        setLoading(false);
      }
    }
    void fetchUsers();
  }, [page, limit]);

  async function handleToggleActive(user: AppUser) {
    try {
      setMutatingId(user.id);
      const token = getAuthTokenFromCookie();
      if (!token) {
        setError("You are not signed in.");
        return;
      }
      const baseUrl = getUserServiceUrl();
      const path = user.isActive
        ? `/users/deactivate/${user.id}`
        : `/users/activate/${user.id}`;

      const res = await fetch(`${baseUrl}${path}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message =
          (data as { message?: string })?.message ||
          "Unable to update user status.";
        setError(message);
        return;
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isActive: !user.isActive } : u,
        ),
      );
    } finally {
      setMutatingId(null);
    }
  }

  const totalPages = total && limit ? Math.ceil(total / limit) : 1;

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-4">
          Users
        </h3>

        {error && !loading && (
          <p className="mb-4 text-sm text-error-500">{error}</p>
        )}

        {loading && <TableSkeleton rows={10} />}

        {!loading && !error && (
          <>
            <AppUsersTable
              users={users}
              onToggleActive={handleToggleActive}
              mutatingId={mutatingId}
            />
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
              <span>
                Page {page} of {totalPages || 1}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1 rounded-lg border border-gray-200 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="px-3 py-1 rounded-lg border border-gray-200 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((p) => (totalPages ? Math.min(totalPages, p + 1) : p))
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AppUsersTable({
  users,
  onToggleActive,
  mutatingId,
}: {
  users: AppUser[];
  onToggleActive: (user: AppUser) => void;
  mutatingId: string | null;
}) {
  if (users.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">User</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Created</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5}>
                  <p className="py-8 text-sm text-gray-500 dark:text-gray-400 text-center">
                    No users found.
                  </p>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">User</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Created</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {users.map((user) => {
                const fullName =
                  (user.firstName || user.lastName
                    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                    : null) || "N/A";
                const initials = fullName !== "N/A"
                  ? (user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "")
                  : user.email.slice(0, 2).toUpperCase();
                return (
                  <TableRow key={user.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                          {user.avatarUrl ? (
                            <Image width={40} height={40} src={user.avatarUrl} alt={fullName} />
                          ) : (
                            <span className="text-theme-sm font-medium text-gray-600 dark:text-gray-400">
                              {initials}
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {fullName}
                          </span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            {user.role ?? "User"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.email}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <Badge
                        size="sm"
                        color={user.isActive ? "success" : "error"}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <button
                        type="button"
                        onClick={() => onToggleActive(user)}
                        disabled={mutatingId === user.id}
                        className={`px-3 py-1 rounded-lg border text-xs font-medium transition-colors ${
                          user.isActive
                            ? "border-error-200 text-error-600 hover:bg-error-50 dark:border-error-500/40 dark:text-error-300 dark:hover:bg-error-500/10"
                            : "border-success-200 text-success-600 hover:bg-success-50 dark:border-success-500/40 dark:text-success-300 dark:hover:bg-success-500/10"
                        } ${mutatingId === user.id ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        {user.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

