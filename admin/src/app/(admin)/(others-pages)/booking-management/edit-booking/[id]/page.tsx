"use client";

import React, { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getAuthTokenFromCookie } from "@/lib/authClient";
import { getBookingServiceUrl } from "@/lib/bookingClient";
import { getEventServiceUrl } from "@/lib/eventClient";

type Booking = {
  booking_id: string;
  booking_reference?: string; // ✅ ADD THIS
  customer_name: string;
  email: string;
  phone_number: string;
  event_id: string;
  event_name: string;
  seat_number?: string;
  ticket_price: number;
};

type EventDetail = {
  _id: string;
  title: string;
  location?: string;
  start?: string;
  end?: string;
  isSeated?: boolean;
  seats?: {
    seatNumber: string;
    price: number;
    bookingStatus: "available" | "reserved" | "sold";
  }[];
};

export default function EditBookingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [ticketPrice, setTicketPrice] = useState<number>(0);
  const [eventDetail, setEventDetail] = useState<EventDetail | null>(null);

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
        const data = (await res.json().catch(() => ({}))) as Booking & {
          error?: string;
        };
        if (!res.ok) {
          setError(data.error || "Failed to load booking.");
          return;
        }
        setCustomerName(data.customer_name || "");
        setEmail(data.email || "");
        setPhoneNumber(data.phone_number || "");
        setSeatNumber(data.seat_number || "");
        setTicketPrice(data.ticket_price || 0);

        const eventRes = await fetch(
          `${getEventServiceUrl()}/events/${data.event_id}`,
        );
        const eventData = (await eventRes.json().catch(() => ({}))) as EventDetail;
        if (eventRes.ok) {
          setEventDetail(eventData);
        } else {
          setEventDetail(null);
        }
      } catch {
        setError("Something went wrong while loading booking.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  useEffect(() => {
    if (!eventDetail?.isSeated || !seatNumber) return;
    const selectedSeat = (eventDetail.seats || []).find(
      (seat) => seat.seatNumber === seatNumber,
    );
    if (selectedSeat) {
      setTicketPrice(selectedSeat.price);
    }
  }, [eventDetail, seatNumber]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!id || saving) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const token = getAuthTokenFromCookie();
      if (!token) {
        setError("You are not signed in.");
        return;
      }

      const res = await fetch(`${getBookingServiceUrl()}/bookings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_name: customerName,
          email,
          phone_number: phoneNumber,
          seat_number: eventDetail?.isSeated ? seatNumber : undefined,
          ticket_price: ticketPrice,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setError(data.error || "Failed to update booking.");
        return;
      }

      setSuccess("Booking updated successfully.");
      setTimeout(() => router.push(`/booking-management/booking/${id}`), 700);
    } catch {
      setError("Something went wrong while updating booking.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Loading booking...
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Edit Booking
        </h3>
        <Link
          href={`/booking-management/booking/${id}`}
          className="rounded-lg border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Back
        </Link>
      </div>

      <form
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
        onSubmit={handleSubmit}
      >
        <div className="rounded-lg border border-gray-200 p-3 md:col-span-2 text-gray-700 dark:border-gray-700 dark:text-gray-200">
          <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
            Event Details
          </p>
          <div className="mt-2 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
            <p>
              <span className="font-medium">Event Name:</span>{" "}
              {eventDetail?.title || "-"}
            </p>
            <p>
              <span className="font-medium">Event ID:</span>{" "}
              {eventDetail?._id || "-"}
            </p>
            <p>
              <span className="font-medium">Location:</span>{" "}
              {eventDetail?.location || "-"}
            </p>
            <p>
              <span className="font-medium">Start:</span>{" "}
              {eventDetail?.start
                ? new Date(eventDetail.start).toLocaleString()
                : "-"}
            </p>
            <p>
              <span className="font-medium">Seated Event:</span>{" "}
              {eventDetail?.isSeated ? "Yes" : "No"}
            </p>
            {eventDetail?.isSeated && (
              <p>
                <span className="font-medium">Selected Seat:</span>{" "}
                {seatNumber || "-"}
              </p>
            )}
          </div>
        </div>

        {eventDetail?.isSeated && (
          <div className="md:col-span-2">
            <label className="mb-2 block text-xs text-gray-500">Seat</label>
            <div className="grid grid-cols-5 gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              {(eventDetail.seats || [])
                .filter(
                  (seat) =>
                    seat.bookingStatus === "available" ||
                    seat.seatNumber === seatNumber,
                )
                .map((seat) => (
                  <button
                    key={seat.seatNumber}
                    type="button"
                    onClick={() => setSeatNumber(seat.seatNumber)}
                    className={`rounded-md border px-2 py-2 text-xs ${
                      seatNumber === seat.seatNumber
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    💺 {seat.seatNumber}
                    <div className="mt-1 text-[10px] opacity-80">
                      LKR {seat.price}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs text-gray-500">
            Customer Name
          </label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">
            Phone Number
          </label>
          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">
            Ticket Price
          </label>
          <input
            type="number"
            min={0}
            value={ticketPrice}
            onChange={(e) => setTicketPrice(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            required
          />
        </div>

        {error && <p className="text-sm text-error-500 md:col-span-2">{error}</p>}
        {success && (
          <p className="text-sm text-success-600 md:col-span-2">{success}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Update Booking"}
        </button>
      </form>
    </div>
  );
}

