const EVENT_SERVICE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

if (!EVENT_SERVICE_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    "NEXT_PUBLIC_EVENT_SERVICE_URL is not set. Event calls will fail until it is configured.",
  );
}

export function getEventServiceUrl() {
  if (!EVENT_SERVICE_URL) {
    throw new Error("NEXT_PUBLIC_EVENT_SERVICE_URL is not configured");
  }
  return EVENT_SERVICE_URL;
}

