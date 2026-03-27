"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  createdAt?: string;
  updatedAt?: string;
};

export default function BookingDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const token = getAuthTokenFromCookie();
        if (!token) {
          setError("You are not signed in.");
          return;
        }

        const res = await fetch(`${getBookingServiceUrl()}/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = (await res.json().catch(() => ({}))) as
          | Booking
          | { error?: string };

        if (!res.ok) {
          setError((data as any)?.error || "Failed to load booking.");
          return;
        }

        setBooking(data as Booking);
      } catch {
        setError("Something went wrong while loading booking.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [id]);

  if (loading) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Loading booking...
      </p>
    );
  }

  if (error) {
    return <p className="text-sm text-error-500">{error}</p>;
  }

  if (!booking) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Booking not found.
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Booking Details
        </h3>
        <div className="flex items-center gap-2">
          <Link
            href={`/booking-management/edit-booking/${booking.booking_id}`}
            className="rounded-lg border border-brand-300 px-3 py-2 text-xs text-brand-600 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-900/20"
          >
            Edit
          </Link>
          <Link
            href="/booking-management/my-bookings"
            className="rounded-lg border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Back
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2  border-gray-200 text-gray-700 dark:border-gray-700  dark:text-gray-200">
        <p>
          <span className="font-medium  text-gray-500">Booking ID:</span> {booking.booking_id}
        </p>
        <p>
          <span className="font-medium  text-gray-500">Booking Reference:</span>{" "}
          {booking.booking_reference || booking.booking_id}
        </p>
        <p>
          <span className="font-medium  text-gray-500">Event:</span> {booking.event_name}
        </p>
        <p>
          <span className="font-medium  text-gray-500">Customer:</span> {booking.customer_name}
        </p>
        <p>
          <span className="font-medium  text-gray-500">Email:</span> {booking.email}
        </p>
        <p>
          <span className="font-medium  text-gray-500">Phone:</span> {booking.phone_number}
        </p>
        <p>
          <span className="font-medium  text-gray-500">Ticket Price:</span> LKR{" "}
          {booking.ticket_price}
        </p>
        <p>
          <span className="font-medium  text-gray-500">Seat Number:</span>{" "}
          {booking.seat_number || "-"}
        </p>
        <p>
          <span className="font-medium  text-gray-500">Event Date:</span>{" "}
          {booking.event_start_date
            ? new Date(booking.event_start_date).toLocaleString()
            : "-"}
        </p>
        <p>
          <span className="font-medium  text-gray-500">Booked On:</span>{" "}
          {booking.booking_date
            ? new Date(booking.booking_date).toLocaleString()
            : "-"}
        </p>
        <p>
          <span className="font-medium  text-gray-500">Booking Time:</span>{" "}
          {booking.booking_time || "-"}
        </p>
      </div>
    </div>
  );
}