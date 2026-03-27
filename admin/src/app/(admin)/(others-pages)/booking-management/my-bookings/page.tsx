"use client";

import React, { useEffect, useMemo, useState } from "react";
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

type LoggedInUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
};

export default function MyBookingHistoryPage() {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  const { upcomingBookings, completedBookings } = useMemo(() => {
    if (!user?.email) {
      return { upcomingBookings: [], completedBookings: [] };
    }

    const now = new Date();

    const filtered = bookings.filter(
      (booking) =>
        booking.email?.toLowerCase() === user.email?.toLowerCase(),
    );

    const upcoming: Booking[] = [];
    const completed: Booking[] = [];

    filtered.forEach((booking) => {
      const eventDate = new Date(
        booking.event_start_date || booking.booking_date,
      );

      if (eventDate >= now) {
        upcoming.push(booking);
      } else {
        completed.push(booking);
      }
    });

    return {
      upcomingBookings: upcoming.sort(
        (a, b) =>
          new Date(a.event_start_date || a.booking_date).getTime() -
          new Date(b.event_start_date || b.booking_date).getTime(),
      ),
      completedBookings: completed.sort(
        (a, b) =>
          new Date(b.event_start_date || b.booking_date).getTime() -
          new Date(a.event_start_date || a.booking_date).getTime(),
      ),
    };
  }, [bookings, user]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;
      setUser(JSON.parse(storedUser));
    } catch {
      setUser(null);
    }
  }, []);

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

        const res = await fetch(`${getBookingServiceUrl()}/bookings`, {
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
              "Failed to load bookings.",
          );
          return;
        }

        setBookings(Array.isArray(data) ? data : []);
      } catch {
        setError("Something went wrong while loading booking history.");
      } finally {
        setLoading(false);
      }
    }

    void loadBookings();
  }, []);

  async function handleCancelBooking(id: string) {
    try {
      setCancelingId(id);
      setError(null);

      const token = getAuthTokenFromCookie();
      if (!token) {
        setError("You are not signed in.");
        return;
      }

      const res = await fetch(`${getBookingServiceUrl()}/bookings/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };

      if (!res.ok) {
        setError(data.error || data.message || "Failed to cancel booking.");
        return;
      }

      setBookings((prev) => prev.filter((b) => b.booking_id !== id));
      setBookingToCancel(null);
    } catch {
      setError("Something went wrong while canceling booking.");
    } finally {
      setCancelingId(null);
    }
  }

  const renderTable = (
    items: Booking[],
    emptyMessage: string,
    type: "upcoming" | "completed",
  ) => (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="px-3 py-2 text-left text-xs text-gray-500">
              Reference
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
              Booking Time
            </th>
            <th className="px-3 py-2 text-left text-xs text-gray-500">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td
                className="px-3 py-6 text-center text-sm text-gray-500"
                colSpan={7}
              >
                {emptyMessage}
              </td>
            </tr>
          )}

          {items.map((booking) => (
            <tr
              key={booking.booking_id}
              className="border-b border-gray-100 dark:border-gray-800"
            >
              <td className="px-3 py-3 text-sm font-semibold text-brand-600 dark:text-brand-300">
                {booking.booking_reference || booking.booking_id}
              </td>
              <td className="px-3 py-3 text-sm text-gray-800 dark:text-white/90">
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
                {booking.booking_time || "-"}
              </td>
              <td className="px-3 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/booking-management/booking/${booking.booking_id}`}
                    className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    View
                  </Link>

                  {type === "upcoming" && (
                    <>
                      <Link
                        href={`/booking-management/edit-booking/${booking.booking_id}`}
                        className="rounded-lg border border-brand-300 px-2 py-1 text-xs text-brand-600 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-900/20"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setBookingToCancel(booking)}
                        disabled={cancelingId === booking.booking_id}
                        className="rounded-lg border border-error-300 px-2 py-1 text-xs text-error-600 hover:bg-error-50 disabled:opacity-60 dark:border-error-700 dark:text-error-300 dark:hover:bg-error-900/20"
                      >
                        {cancelingId === booking.booking_id
                          ? "Canceling..."
                          : "Cancel"}
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
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            My Booking History
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View all bookings made by your account
          </p>
        </div>

        <Link
          href="/booking-management/book-event"
          className="rounded-lg bg-brand-500 px-3 py-2 text-xs font-medium text-white hover:bg-brand-600"
        >
          + Book an Event
        </Link>
      </div>

      {loading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading your booking history...
        </p>
      )}

      {error && <p className="mb-3 text-sm text-error-500">{error}</p>}

      {!loading && !error && (
        <div className="space-y-8">
          <div>
            <h4 className="mb-3 text-md font-semibold text-green-600 dark:text-green-400">
              Bookings Of Upcoming Events
            </h4>
            {renderTable(
              upcomingBookings,
              "No upcoming bookings found.",
              "upcoming",
            )}
          </div>

          <div>
            <h4 className="mb-3 text-md font-semibold text-gray-500 dark:text-gray-400">
              Bookings Of Completed Events
            </h4>
            {renderTable(
              completedBookings,
              "No completed bookings found.",
              "completed",
            )}
          </div>
        </div>
      )}

      {bookingToCancel && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Cancel Booking
            </h4>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to cancel booking{" "}
              <span className="font-medium">
                {bookingToCancel.booking_reference || bookingToCancel.booking_id}
              </span>
              ?
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Event: <span className="font-medium">{bookingToCancel.event_name}</span>
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Seat: <span className="font-medium">{bookingToCancel.seat_number || "-"}</span>
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setBookingToCancel(null)}
                disabled={cancelingId === bookingToCancel.booking_id}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={() => handleCancelBooking(bookingToCancel.booking_id)}
                disabled={cancelingId === bookingToCancel.booking_id}
                className="rounded-lg border border-error-300 bg-error-50 px-3 py-1.5 text-xs text-error-700 hover:bg-error-100 disabled:opacity-60 dark:border-error-700 dark:bg-error-900/20 dark:text-error-300 dark:hover:bg-error-900/40"
              >
                {cancelingId === bookingToCancel.booking_id
                  ? "Canceling..."
                  : "Yes, Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}