const BOOKING_SERVICE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";

if (!BOOKING_SERVICE_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    "NEXT_PUBLIC_BOOKING_SERVICE_URL is not set. Booking calls will fail until it is configured.",
  );
}

export function getBookingServiceUrl() {
  if (!BOOKING_SERVICE_URL) {
    throw new Error("NEXT_PUBLIC_BOOKING_SERVICE_URL is not configured");
  }
  return BOOKING_SERVICE_URL;
}

