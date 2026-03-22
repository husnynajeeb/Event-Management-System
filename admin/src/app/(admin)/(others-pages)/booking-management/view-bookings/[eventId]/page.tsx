"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getAuthTokenFromCookie } from "@/lib/authClient";
import { getBookingServiceUrl } from "@/lib/bookingClient";
import { getEventServiceUrl } from "@/lib/eventClient";

type Booking = {
  booking_id: string;
  customer_name: string;
  email: string;
  phone_number: string;
  event_id: string;
  event_name: string;
  seat_number?: string;
  ticket_price: number;
  booking_date: string;
  booking_time: string;
};

type EventItem = { _id: string; title: string };

export default function EventBookingsPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params?.eventId;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  const eventBookings = useMemo(
    () => bookings.filter((b) => b.event_id === eventId),
    [bookings, eventId],
  );

  useEffect(() => {
    async function load() {
      if (!eventId) return;
      try {
        setLoading(true);
        setError(null);

        const [eventRes, bookingsRes] = await Promise.all([
          fetch(`${getEventServiceUrl()}/events/${eventId}`),
          (async () => {
            const token = getAuthTokenFromCookie();
            if (!token) throw new Error("You are not signed in.");
            return fetch(`${getBookingServiceUrl()}/bookings`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          })(),
        ]);

        const eventData = (await eventRes.json().catch(() => ({}))) as
          | EventItem
          | { message?: string };
        if (eventRes.ok) setEvent(eventData as EventItem);

        const bookingsData = (await bookingsRes.json().catch(() => [])) as
          | Booking[]
          | { error?: string; message?: string };
        if (!bookingsRes.ok) {
          setError(
            (bookingsData as any)?.error ||
              (bookingsData as any)?.message ||
              "Failed to load bookings.",
          );
          return;
        }
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [eventId]);

  async function handleDelete(id: string) {
    try {
      setDeletingId(id);
      const token = getAuthTokenFromCookie();
      if (!token) {
        setError("You are not signed in.");
        return;
      }
      const res = await fetch(`${getBookingServiceUrl()}/bookings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error || data.message || "Failed to delete booking.");
        return;
      }
      setBookings((prev) => prev.filter((b) => b.booking_id !== id));
    } catch {
      setError("Something went wrong while deleting booking.");
    } finally {
      setDeletingId(null);
      setBookingToDelete(null);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {event?.title ? `Bookings: ${event.title}` : "Event Bookings"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Event ID: {eventId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/event-management/view-events/${eventId}`}
            className="rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            View Event
          </Link>
          <Link
            href={`/booking-management/book-event?eventId=${eventId}`}
            className="rounded-lg bg-brand-500 px-3 py-2 text-xs font-medium text-white hover:bg-brand-600"
          >
            + Book
          </Link>
          <Link
            href="/booking-management/view-bookings"
            className="rounded-lg border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Back
          </Link>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading bookings...
        </p>
      )}
      {error && <p className="mb-3 text-sm text-error-500">{error}</p>}

      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 py-2 text-left text-xs text-gray-500">
                  Customer
                </th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">
                  Email
                </th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">
                  Phone
                </th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">
                  Seat
                </th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">
                  Price
                </th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {eventBookings.length === 0 && (
                <tr>
                  <td
                    className="px-3 py-6 text-center text-sm text-gray-500"
                    colSpan={6}
                  >
                    No bookings for this event.
                  </td>
                </tr>
              )}
              {eventBookings.map((b) => (
                <tr
                  key={b.booking_id}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="px-3 py-3 text-sm text-gray-800 dark:text-white/90">
                    {b.customer_name}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {b.email}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {b.phone_number}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {b.seat_number || "-"}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {b.ticket_price}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/booking-management/booking/${b.booking_id}`}
                        className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        View
                      </Link>
                      <Link
                        href={`/booking-management/edit-booking/${b.booking_id}`}
                        className="rounded-lg border border-brand-300 px-2 py-1 text-xs text-brand-600 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-900/20"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setBookingToDelete(b)}
                        disabled={deletingId === b.booking_id}
                        className="rounded-lg border border-error-300 px-2 py-1 text-xs text-error-600 hover:bg-error-50 disabled:opacity-60 dark:border-error-700 dark:text-error-300 dark:hover:bg-error-900/20"
                      >
                        {deletingId === b.booking_id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {bookingToDelete && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Delete Booking
            </h4>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete booking{" "}
              <span className="font-medium">{bookingToDelete.booking_id}</span>?
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setBookingToDelete(null)}
                disabled={deletingId === bookingToDelete.booking_id}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(bookingToDelete.booking_id)}
                disabled={deletingId === bookingToDelete.booking_id}
                className="rounded-lg border border-error-300 bg-error-50 px-3 py-1.5 text-xs text-error-700 hover:bg-error-100 disabled:opacity-60 dark:border-error-700 dark:bg-error-900/20 dark:text-error-300 dark:hover:bg-error-900/40"
              >
                {deletingId === bookingToDelete.booking_id
                  ? "Deleting..."
                  : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

