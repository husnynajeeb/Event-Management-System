"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getEventServiceUrl } from "@/lib/eventClient";


type EventItem = {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  start?: string;
  end?: string;
  status?: string;
};

export default function EventsForReviewsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${getEventServiceUrl()}/events`);
        const data = (await res.json().catch(() => [])) as EventItem[];

        if (!res.ok) {
          setError("Failed to fetch events.");
          return;
        }

        setEvents(Array.isArray(data) ? data : []);
      } catch {
        setError("Something went wrong while fetching events.");
      } finally {
        setLoading(false);
      }
    }

    void loadEvents();
  }, []);

  if (loading) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Loading events...
      </p>
    );
  }

  if (error) {
    return <p className="text-sm text-error-500">{error}</p>;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Events
        </h3>
        <Link
          href="/"
          className="rounded-lg border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Back
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No events found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Event Name
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Location
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event._id}
                  className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                >
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                    {event.title}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {event.location || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {event.start
                      ? new Date(event.start).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {event.status || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        router.push(`/reviews/booked-events/${event._id}/reviews`)
                      }
                      className="rounded-lg border border-brand-300 px-3 py-1 text-xs text-brand-600 hover:bg-brand-50 dark:border-brand-600 dark:text-brand-400 dark:hover:bg-brand-900/20"
                    >
                      View / Write Review
                    </button>
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