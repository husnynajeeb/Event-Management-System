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
  start?: string;
  end?: string;
  seats?: Seat[];
};

type LoggedInUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
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

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingReference, setBookingReference] = useState("");

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;

      const user = JSON.parse(storedUser) as LoggedInUser;
      const fullName = [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

      if (fullName) setCustomerName(fullName);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhoneNumber(user.phone);
    } catch {
      // ignore localStorage parse errors
    }
  }, []);

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

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!selectedEvent) {
      setError("Please select an event.");
      return;
    }

    if (selectedEvent.isSeated && !selectedSeatNumber) {
      setError("Please select an available seat.");
      return;
    }

    setShowConfirmModal(true);
  }

  async function handleConfirmBooking() {
    if (submitting) return;
    setError(null);

    try {
      setSubmitting(true);

      const token = getAuthTokenFromCookie();
      if (!token) {
        setError("You are not signed in.");
        setShowConfirmModal(false);
        return;
      }

      if (!selectedEvent) {
        setError("Please select an event.");
        setShowConfirmModal(false);
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
        booking_reference?: string;
        booking?: { booking_id?: string };
      };

      if (!res.ok) {
        setError(data.error || "Failed to create booking.");
        setShowConfirmModal(false);
        return;
      }

      setBookingReference(
        data.booking_reference ||
          data.booking_id ||
          data.booking?.booking_id ||
          "BOOKING-REF-NOT-AVAILABLE",
      );

      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch {
      setError("Something went wrong while creating booking.");
      setShowConfirmModal(false);
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
          href="/booking-management/my-bookings"
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

        {error && (
          <p className="text-sm text-error-500 md:col-span-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {submitting ? "Booking..." : "Book"}
        </button>
      </form>

      {showConfirmModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
              Confirm Booking
            </h4>

            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p>
                <strong>Event:</strong> {selectedEvent.title}
              </p>
              <p>
                <strong>Event Date:</strong>{" "}
                {selectedEvent.start
                  ? new Date(selectedEvent.start).toLocaleString()
                  : "N/A"}
              </p>
              <p>
                <strong>Seat Number:</strong> {selectedSeatNumber || "N/A"}
              </p>
              <p>
                <strong>Price:</strong> LKR {ticketPrice}
              </p>
              <p>
                <strong>Name:</strong> {customerName}
              </p>
              <p>
                <strong>Email:</strong> {email}
              </p>
              <p>
                <strong>Phone:</strong> {phoneNumber}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h4 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white">
              Booking Confirmed
            </h4>

            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              Your booking has been created successfully.
            </p>

            <div className="mb-4 rounded-lg border border-dashed border-brand-400 bg-brand-50 p-4 text-center dark:bg-brand-900/20">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Booking Reference
              </p>
              <p className="mt-1 text-lg font-bold text-brand-700 dark:text-brand-300">
                {bookingReference}
              </p>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300">
              Please keep this booking reference and present it at the venue
              when making payment.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/booking-management/my-bookings");
                }}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                Go to Bookings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}