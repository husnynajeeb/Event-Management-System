const USER_SERVICE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4003";

if (!USER_SERVICE_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    "NEXT_PUBLIC_USER_SERVICE_URL is not set. Auth calls will fail until it is configured.",
  );
}

export function getUserServiceUrl() {
  if (!USER_SERVICE_URL) {
    throw new Error("NEXT_PUBLIC_USER_SERVICE_URL is not configured");
  }
  return USER_SERVICE_URL;
}

export function setAuthTokenCookie(token: string) {
  const maxAgeSeconds = 60 * 60 * 24 * 7;
  const encodedToken = encodeURIComponent(token);
  document.cookie = `auth_token=${encodedToken}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
  if (typeof window !== "undefined") {
    window.localStorage.setItem("auth_token", token);
  }
}

export function clearAuthTokenCookie() {
  document.cookie =
    "auth_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("auth_token");
  }
}

export function getAuthTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);
  return window.localStorage.getItem("auth_token");
}

