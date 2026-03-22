"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuthTokenFromCookie } from "@/lib/authClient";
import { getBookingServiceUrl } from "@/lib/bookingClient";

type Booking = {
  _id: string;
  customer_name: string;
  email: string;
  phone_number: string;
  event_id: string;
  event_name: string;
  seat_number?: string;
  ticket_price: number;
  createdAt: string;
};

export default function BookedEventsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        const token = getAuthTokenFromCookie();
        if (!token) {
          setError("You are not signed in.");
          return;
        }

        const res = await fetch(`${getBookingServiceUrl()}/bookings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = (await res.json().catch(() => [])) as Booking[];
        if (!res.ok) {
          setError("Failed to fetch bookings.");
          return;
        }

        setBookings(Array.isArray(data) ? data : []);
      } catch {
        setError("Something went wrong while fetching bookings.");
      } finally {
        setLoading(false);
      }
    }

    void loadBookings();
  }, []);

  async function handleDelete(bookingId: string) {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      setDeleting(bookingId);
      const token = getAuthTokenFromCookie();
      const res = await fetch(`${getBookingServiceUrl()}/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        alert("Failed to delete booking.");
        return;
      }

      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
    } catch {
      alert("Something went wrong while deleting.");
    } finally {
      setDeleting(null);
    }
  }

  if (loading) return <p className="text-sm text-gray-500 dark:text-gray-400">Loading bookings...</p>;
  if (error) return <p className="text-sm text-error-500">{error}</p>;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Booked Events
        </h3>
        <Link
          href="/reviews"
          className="rounded-lg border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Back
        </Link>
      </div>

      {bookings.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No bookings found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Customer Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Event Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Phone</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Seat</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Price</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Booked On</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{booking.customer_name}</td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{booking.event_name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{booking.email}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{booking.phone_number}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{booking.seat_number || "-"}</td>
                  <td className="px-4 py-3 font-medium text-brand-600 dark:text-brand-400">LKR {booking.ticket_price}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => router.push(`/reviews/booked-events/${booking.event_id}/reviews`)}
                      className="rounded-lg border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      View
                    </button>
                    <button
                      onClick={() => router.push(`/reviews/booked-events/${booking._id}/edit`)}
                      className="rounded-lg border border-brand-300 px-3 py-1 text-xs text-brand-600 hover:bg-brand-50 dark:border-brand-600 dark:text-brand-400 dark:hover:bg-brand-900/20"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(booking._id)}
                      disabled={deleting === booking._id}
                      className="rounded-lg border border-error-300 px-3 py-1 text-xs text-error-600 hover:bg-error-50 disabled:opacity-50 dark:border-error-600 dark:text-error-400 dark:hover:bg-error-900/20"
                    >
                      {deleting === booking._id ? "Deleting..." : "Delete"}
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