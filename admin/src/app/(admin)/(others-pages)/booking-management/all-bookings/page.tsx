"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAuthTokenFromCookie } from "@/lib/authClient";
import { getBookingServiceUrl } from "@/lib/bookingClient";

type Booking = {
  booking_id: string;
  booking_reference?: string;
  customer_name: string;
  email: string;
  phone_number: string;
  event_id: string;
  event_name: string;
  event_start_date?: string;
  event_end_date?: string;
  seat_number?: string;
  ticket_price: number;
  booking_date: string;
  booking_time: string;
};

export default function AdminAllBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        setError(null);

        const token = getAuthTokenFromCookie();
        if (!token) {
          setError("You are not signed in.");
          return;
        }

        const res = await fetch(`${getBookingServiceUrl()}/admin/bookings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = (await res.json().catch(() => [])) as
          | Booking[]
          | { error?: string; message?: string };

        if (!res.ok) {
          setError(
            (data as any)?.error ||
              (data as any)?.message ||
              "Failed to load all bookings.",
          );
          return;
        }

        setBookings(Array.isArray(data) ? data : []);
      } catch {
        setError("Something went wrong while loading all bookings.");
      } finally {
        setLoading(false);
      }
    }

    void loadBookings();
  }, []);

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this booking?",
    );
    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError(null);

      const token = getAuthTokenFromCookie();
      if (!token) {
        setError("You are not signed in.");
        return;
      }

      const res = await fetch(`${getBookingServiceUrl()}/admin/bookings/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };

      if (!res.ok) {
        setError(data.error || data.message || "Failed to delete booking.");
        return;
      }

      setBookings((prev) => prev.filter((booking) => booking.booking_id !== id));
    } catch {
      setError("Something went wrong while deleting the booking.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            View All Bookings
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Admin can monitor all bookings made by all users
          </p>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading all bookings...
        </p>
      )}

      {error && <p className="mb-3 text-sm text-error-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 py-2 text-left text-xs text-gray-500">
                  Reference
                </th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">
                  Customer
                </th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">
                  Email
                </th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">
                  Event
                </th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">
                  Seat
                </th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">
                  Price
                </th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">
                  Event Date
                </th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">
                  Booked On
                </th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-6 text-center text-sm text-gray-500"
                  >
                    No bookings found.
                  </td>
                </tr>
              )}

              {bookings.map((booking) => (
                <tr
                  key={booking.booking_id}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="px-3 py-3 text-sm font-semibold text-brand-600 dark:text-brand-300">
                    {booking.booking_reference || booking.booking_id}
                  </td>

                  <td className="px-3 py-3 text-sm text-gray-800 dark:text-white/90">
                    {booking.customer_name}
                  </td>

                  <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {booking.email}
                  </td>

                  <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {booking.event_name}
                  </td>

                  <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {booking.seat_number || "-"}
                  </td>

                  <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                    LKR {booking.ticket_price}
                  </td>

                  <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {booking.event_start_date
                      ? new Date(booking.event_start_date).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {booking.booking_date
                      ? new Date(booking.booking_date).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/booking-management/booking/${booking.booking_id}`}
                        className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        View
                      </Link>

                      <Link
                        href={`/booking-management/edit-booking/${booking.booking_id}`}
                        className="rounded-lg border border-brand-300 px-2 py-1 text-xs text-brand-600 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-900/20"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(booking.booking_id)}
                        disabled={deletingId === booking.booking_id}
                        className="rounded-lg border border-error-300 px-2 py-1 text-xs text-error-600 hover:bg-error-50 disabled:opacity-60 dark:border-error-700 dark:text-error-300 dark:hover:bg-error-900/20"
                      >
                        {deletingId === booking.booking_id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
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