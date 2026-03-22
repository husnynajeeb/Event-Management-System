"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuthTokenFromCookie } from "@/lib/authClient";
import { getBookingServiceUrl } from "@/lib/bookingClient";
import { getEventServiceUrl } from "@/lib/eventClient";

type Seat = {
  seatNumber: string;
  row: number;
  column: number;
  price: number;
  bookingStatus: "available" | "reserved" | "sold";
};

type EventItem = {
  _id: string;
  title: string;
  isSeated?: boolean;
  seats?: Seat[];
};

export default function BookEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedEventId = searchParams.get("eventId") || "";

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventId, setEventId] = useState(preselectedEventId);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [loadingEventDetails, setLoadingEventDetails] = useState(false);
  const [selectedSeatNumber, setSelectedSeatNumber] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [ticketPrice, setTicketPrice] = useState<number>(0);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoadingEvents(true);
        const res = await fetch(`${getEventServiceUrl()}/events`);
        const data = (await res.json().catch(() => [])) as EventItem[];
        setEvents(Array.isArray(data) ? data : []);
      } finally {
        setLoadingEvents(false);
      }
    }
    void loadEvents();
  }, []);

  useEffect(() => {
    async function loadEventDetails() {
      if (!eventId) {
        setSelectedEvent(null);
        setSelectedSeatNumber("");
        setTicketPrice(0);
        return;
      }

      try {
        setLoadingEventDetails(true);
        const res = await fetch(`${getEventServiceUrl()}/events/${eventId}`);
        const data = (await res.json().catch(() => ({}))) as EventItem;
        if (!res.ok) {
          setSelectedEvent(null);
          return;
        }

        setSelectedEvent(data);
        if (data.isSeated) {
          const firstAvailable = (data.seats || []).find(
            (seat) => seat.bookingStatus === "available",
          );
          setSelectedSeatNumber(firstAvailable?.seatNumber || "");
          setTicketPrice(firstAvailable?.price || 0);
        } else {
          setSelectedSeatNumber("");
          const firstPrice = data.seats?.[0]?.price ?? 0;
          setTicketPrice(firstPrice);
        }
      } finally {
        setLoadingEventDetails(false);
      }
    }
    void loadEventDetails();
  }, [eventId]);

  useEffect(() => {
    if (!selectedEvent?.isSeated) return;
    if (!selectedSeatNumber) {
      setTicketPrice(0);
      return;
    }
    const selectedSeat = (selectedEvent.seats || []).find(
      (seat) => seat.seatNumber === selectedSeatNumber,
    );
    setTicketPrice(selectedSeat?.price || 0);
  }, [selectedEvent, selectedSeatNumber]);

  const availableSeats = useMemo(
    () =>
      (selectedEvent?.seats || []).filter(
        (seat) => seat.bookingStatus === "available",
      ),
    [selectedEvent],
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    try {
      setSubmitting(true);
      const token = getAuthTokenFromCookie();
      if (!token) {
        setError("You are not signed in.");
        return;
      }
      if (!selectedEvent) {
        setError("Please select an event.");
        return;
      }
      if (selectedEvent.isSeated && !selectedSeatNumber) {
        setError("Please select an available seat.");
        return;
      }

      const res = await fetch(`${getBookingServiceUrl()}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_name: customerName,
          email,
          phone_number: phoneNumber,
          event_id: selectedEvent._id,
          event_name: selectedEvent.title,
          seat_number: selectedEvent.isSeated ? selectedSeatNumber : undefined,
          ticket_price: ticketPrice,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        booking_id?: string;
      };
      if (!res.ok) {
        setError(data.error || "Failed to create booking.");
        return;
      }

      router.push(`/booking-management/view-bookings/${selectedEvent._id}`);
    } catch {
      setError("Something went wrong while creating booking.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Book an Event
        </h3>
        <Link
          href="/booking-management/view-bookings"
          className="rounded-lg border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Back
        </Link>
      </div>

      <form
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
        onSubmit={handleSubmit}
      >
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-gray-500">Event</label>
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 ${
              eventId
                ? "text-gray-800 dark:text-gray-200"
                : "text-gray-500 dark:text-gray-400"
            }`}
            disabled={loadingEvents}
            required
          >
            <option value="" disabled>
              {loadingEvents ? "Loading events..." : "Select an event"}
            </option>
            {events.map((e) => (
              <option key={e._id} value={e._id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>
        {loadingEventDetails && (
          <p className="text-sm text-gray-500 md:col-span-2">
            Loading selected event details...
          </p>
        )}
        {selectedEvent?.isSeated && (
          <div className="md:col-span-2">
            <label className="mb-2 block text-xs text-gray-500">
              Select Seat
            </label>
            {availableSeats.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No available seats for this event.
              </p>
            ) : (
              <div className="grid grid-cols-5 gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                {availableSeats
                  .sort((a, b) => a.row - b.row || a.column - b.column)
                  .map((seat) => (
                    <button
                      key={seat.seatNumber}
                      type="button"
                      onClick={() => setSelectedSeatNumber(seat.seatNumber)}
                      className={`rounded-md border px-2 py-2 text-xs ${
                        selectedSeatNumber === seat.seatNumber
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
            )}
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs text-gray-500">
            Customer Name
          </label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500"
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
            placeholder="Enter phone number"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500"
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
            placeholder="Ticket price"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500"
            readOnly={!!selectedEvent}
            required
          />
        </div>

        {error && <p className="text-sm text-error-500 md:col-span-2">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {submitting ? "Booking..." : "Book"}
        </button>
      </form>
    </div>
  );
}

