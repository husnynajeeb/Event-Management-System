"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getEventServiceUrl } from "@/lib/eventClient";

type EventItem = {
  _id: string;
  title: string;
  start: string;
  location?: string;
  status?: string;
};

export default function ViewBookingsEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return events;
    return events.filter((e) => e.title.toLowerCase().includes(query));
  }, [events, q]);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${getEventServiceUrl()}/events`);
        const data = (await res.json().catch(() => [])) as EventItem[] | {
          message?: string;
        };
        if (!res.ok) {
          setError(
            (data as { message?: string })?.message || "Failed to fetch events.",
          );
          return;
        }
        setEvents(Array.isArray(data) ? data : []);
      } catch {
        setError("Something went wrong while loading events.");
      } finally {
        setLoading(false);
      }
    }
    void loadEvents();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          View Bookings
        </h3>
        <Link
          href="/booking-management/book-event"
          className="rounded-lg bg-brand-500 px-3 py-2 text-xs font-medium text-white hover:bg-brand-600"
        >
          + Book an Event
        </Link>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-xs text-gray-500">Search event</label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type event title..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:placeholder:text-gray-500"
        />
      </div>

      {loading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading events...
        </p>
      )}
      {error && <p className="mb-3 text-sm text-error-500">{error}</p>}

      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 py-2 text-left text-xs text-gray-500">
                  Event
                </th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">
                  Start
                </th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    className="px-3 py-6 text-center text-sm text-gray-500"
                    colSpan={4}
                  >
                    No events found.
                  </td>
                </tr>
              )}
              {filtered.map((event) => (
                <tr
                  key={event._id}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="px-3 py-3 text-sm text-gray-800 dark:text-white/90">
                    {event.title}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {event.start ? new Date(event.start).toLocaleString() : "-"}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {event.status || "-"}
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/booking-management/view-bookings/${event._id}`}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      View bookings
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

