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
};

export default function ViewEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);

  async function loadEvents() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${getEventServiceUrl()}/events`);
      const data = (await res.json().catch(() => [])) as EventItem[] | { message?: string };
      if (!res.ok) {
        setError((data as { message?: string })?.message || "Failed to fetch events.");
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
      const data = (await res.json().catch(() => ({}))) as { message?: string };
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

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          View Events
        </h3>
        <Link href="/event-management/create-event" className="rounded-lg bg-brand-500 px-3 py-2 text-xs font-medium text-white hover:bg-brand-600">
          + Create Event
        </Link>
      </div>

      {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading events...</p>}
      {error && <p className="mb-3 text-sm text-error-500">{error}</p>}

      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 py-2 text-left text-xs text-gray-500">Title</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Location</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Start</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Status</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-sm text-gray-500" colSpan={5}>
                    No events found.
                  </td>
                </tr>
              )}
              {events.map((event) => (
                <tr key={event._id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="px-3 py-3 text-sm text-gray-800 dark:text-white/90">{event.title}</td>
                  <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">{event.location || "-"}</td>
                  <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">{new Date(event.start).toLocaleString()}</td>
                  <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">{event.status || "active"}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/event-management/view-events/${event._id}`} className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                        View
                      </Link>
                      <Link href={`/event-management/edit-event/${event._id}`} className="rounded-lg border border-brand-300 px-2 py-1 text-xs text-brand-600 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-900/20">
                        Edit
                      </Link>
                      <button type="button" onClick={() => setEventToDelete(event)} disabled={deletingId === event._id} className="rounded-lg border border-error-300 px-2 py-1 text-xs text-error-600 hover:bg-error-50 disabled:opacity-60 dark:border-error-700 dark:text-error-300 dark:hover:bg-error-900/20">
                        {deletingId === event._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {eventToDelete && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Delete Event
            </h4>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete{" "}
              <span className="font-medium">{eventToDelete.title}</span>?
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                disabled={deletingId === eventToDelete._id}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(eventToDelete._id)}
                disabled={deletingId === eventToDelete._id}
                className="rounded-lg border border-error-300 bg-error-50 px-3 py-1.5 text-xs text-error-700 hover:bg-error-100 disabled:opacity-60 dark:border-error-700 dark:bg-error-900/20 dark:text-error-300 dark:hover:bg-error-900/40"
              >
                {deletingId === eventToDelete._id ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

