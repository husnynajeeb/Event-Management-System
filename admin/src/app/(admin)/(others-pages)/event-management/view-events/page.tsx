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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
      day: date.getDate(),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:p-8">
          {/* Header */}
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              View Events
            </h1>

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
            <div className="mb-6 rounded-lg border border-error-200 bg-error-50 p-4 text-sm text-error-700 dark:border-error-800 dark:bg-error-900/20 dark:text-error-300">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-brand-500 dark:border-gray-600 dark:border-t-brand-400"></div>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Loading events...
                </p>
              </div>
            </div>
          )}

          {/* Events Grid */}
          {!loading && (
            <>
              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <svg
                    className="h-16 w-16 text-gray-300 dark:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-400">
                    No events found
                  </p>
                  {isAdmin && (
                    <Link
                      href="/event-management/create-event"
                      className="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                    >
                      Create First Event
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {events.map((event) => {
                    const dateInfo = formatDate(event.start);
                    return (
                      <div
                        key={event._id}
                        className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                      >
                        {/* Cover Image */}
                        <div className="relative h-40 overflow-hidden bg-gray-200 dark:bg-gray-700">
                          {event.coverImage ? (
                            <img
                              src={event.coverImage}
                              alt={event.title}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                              <svg
                                className="h-12 w-12 text-gray-400"
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

                          {/* Date Badge */}
                          <div className="absolute left-3 top-3 rounded-lg bg-white p-2 text-center shadow-md dark:bg-gray-900">
                            <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
                              {dateInfo.month}
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {dateInfo.day}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <div className="absolute right-3 top-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
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
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-4">
                          <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">
                            {event.title}
                          </h3>

                          <div className="mb-3 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                            {event.location && (
                              <div className="flex items-start gap-2">
                                <svg
                                  className="mt-0.5 h-4 w-4 flex-shrink-0"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                <span className="line-clamp-1">{event.location}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <svg
                                className="h-4 w-4 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span>{dateInfo.time}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2 pt-3">
                            <Link
                              href={`/event-management/view-events/${event._id}`}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                              View
                            </Link>
                            {isAdmin && (
                              <div className="flex gap-2">
                                <Link
                                  href={`/event-management/edit-event/${event._id}`}
                                  className="flex-1 rounded-lg border border-brand-300 px-3 py-2 text-center text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-900/30"
                                >
                                  Edit
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => setEventToDelete(event)}
                                  disabled={deletingId === event._id}
                                  className="flex-1 rounded-lg border border-error-300 px-3 py-2 text-center text-xs font-medium text-error-600 transition-colors hover:bg-error-50 disabled:opacity-60 dark:border-error-700 dark:text-error-300 dark:hover:bg-error-900/30"
                                >
                                  {deletingId === event._id ? "..." : "Delete"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

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