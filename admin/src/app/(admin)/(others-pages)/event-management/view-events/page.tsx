"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAuthTokenFromCookie } from "@/lib/authClient";
import { getEventServiceUrl } from "@/lib/eventClient";

type EventItem = {
  _id: string;
  title: string;
  location?: string;
  status?: "active" | "cancelled" | "completed";
  start: string;
  end: string;
  coverImage?: string;
};

export default function ViewEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${getEventServiceUrl()}/events`);
      const data = (await res.json().catch(() => [])) as
        | EventItem[]
        | { message?: string };

      if (!res.ok) {
        setError(
          (data as { message?: string })?.message || "Failed to fetch events.",
        );
        return;
      }

      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setError("Something went wrong while fetching events.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEvents();
  }, []);

  async function handleDelete(id: string) {
    try {
      setDeletingId(id);
      const token = getAuthTokenFromCookie();

      if (!token) {
        setError("You are not signed in.");
        return;
      }

      const res = await fetch(`${getEventServiceUrl()}/events/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!res.ok) {
        setError(data.message || "Failed to delete event.");
        return;
      }

      setEvents((prev) => prev.filter((event) => event._id !== id));
    } catch {
      setError("Something went wrong while deleting event.");
    } finally {
      setDeletingId(null);
      setEventToDelete(null);
    }
  }

  const isAdmin = userRole === "ADMIN";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          View Events
        </h3>

        {isAdmin && (
          <Link
            href="/event-management/create-event"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700"
          >
            <span>+</span>
            <span>Create Event</span>
          </Link>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-lg border border-error-200 bg-error-50 p-4 text-sm text-error-700 dark:border-error-800 dark:bg-error-900/20 dark:text-error-300">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading events...
          </p>
        </div>
      )}

      {/* Events Table */}
      {!loading && (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Cover
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Start Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {events.length === 0 && (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                      colSpan={6}
                    >
                      No events found.
                    </td>
                  </tr>
                )}

                {events.map((event) => (
                  <tr
                    key={event._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {/* Cover Image Column */}
                    <td className="px-4 py-4">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                        {event.coverImage ? (
                          <img
                            src={event.coverImage}
                            alt={event.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <svg
                              className="h-8 w-8 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Title Column */}
                    <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </td>

                    {/* Location Column */}
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {event.location || "-"}
                    </td>

                    {/* Start Date Column */}
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {new Date(event.start).toLocaleString()}
                    </td>

                    {/* Status Column */}
                    <td className="px-4 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          event.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : event.status === "completed"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : event.status === "cancelled"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {event.status || "active"}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/event-management/view-events/${event._id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          View
                        </Link>

                        {isAdmin && (
                          <>
                            <Link
                              href={`/event-management/edit-event/${event._id}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-brand-300 px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-900/30"
                            >
                              Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => setEventToDelete(event)}
                              disabled={deletingId === event._id}
                              className="inline-flex items-center gap-1 rounded-lg border border-error-300 px-3 py-1.5 text-xs font-medium text-error-600 transition-colors hover:bg-error-50 disabled:opacity-60 dark:border-error-700 dark:text-error-300 dark:hover:bg-error-900/30"
                            >
                              {deletingId === event._id ? "Deleting..." : "Delete"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isAdmin && eventToDelete && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-in fade-in zoom-in-95 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
            {/* Modal Header */}
            <div className="mb-4">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                Delete Event
              </h4>
            </div>

            {/* Modal Body */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  "{eventToDelete.title}"
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                disabled={deletingId === eventToDelete._id}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-60 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(eventToDelete._id)}
                disabled={deletingId === eventToDelete._id}
                className="rounded-lg bg-error-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-error-700 disabled:opacity-60 dark:bg-error-700 dark:hover:bg-error-800"
              >
                {deletingId === eventToDelete._id ? "Deleting..." : "Delete Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}