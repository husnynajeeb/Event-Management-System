"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getAuthTokenFromCookie,
  getUserServiceUrl,
} from "@/lib/authClient";
import { getEventServiceUrl } from "@/lib/eventClient";
import { getBookingServiceUrl } from "@/lib/bookingClient";
import { CalenderIcon, GroupIcon, ListIcon, UserCircleIcon } from "@/icons";

type EventItem = {
  _id: string;
  title: string;
  start?: string;
  status?: string;
};

type BookingItem = {
  booking_id?: string;
  email?: string;
  event_name?: string;
  event_start_date?: string;
};

type LoggedInUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
};

export default function DashboardOverview() {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [totalBookings, setTotalBookings] = useState<number>(0);

  const [myBookings, setMyBookings] = useState<number>(0);
  const [upcomingEvents, setUpcomingEvents] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedRole = localStorage.getItem("role");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      setUserRole(storedRole);
    } catch {
      setUser(null);
      setUserRole(null);
    }
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const token = getAuthTokenFromCookie();
        if (!token) {
          setError("You are not signed in.");
          return;
        }

        const userUrl = getUserServiceUrl();
        const eventUrl = getEventServiceUrl();
        const bookingUrl = getBookingServiceUrl();

        const now = new Date();

        const eventsRes = await fetch(`${eventUrl}/events`);
        const eventsData = (await eventsRes.json().catch(() => [])) as EventItem[];

        if (!eventsRes.ok) {
          setError("Unable to load dashboard data.");
          return;
        }

        const eventsArray = Array.isArray(eventsData) ? eventsData : [];
        setTotalEvents(eventsArray.length);

        const upcoming = eventsArray.filter((event) => {
          if (!event.start) return false;
          return new Date(event.start) >= now;
        });
        setUpcomingEvents(upcoming.length);

        if (userRole === "ADMIN") {
          const [usersRes, bookingsRes] = await Promise.all([
            fetch(`${userUrl}/users?page=1&limit=1`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${bookingUrl}/admin/bookings`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const usersData = (await usersRes.json().catch(() => ({}))) as {
            total?: number;
            message?: string;
          };

          const bookingsData = (await bookingsRes.json().catch(() => [])) as
            | BookingItem[]
            | { message?: string; error?: string };

          if (!usersRes.ok) {
            setError(usersData.message || "Unable to load admin dashboard.");
            return;
          }

          if (!bookingsRes.ok) {
            setError(
              (bookingsData as { message?: string; error?: string })?.error ||
                (bookingsData as { message?: string; error?: string })?.message ||
                "Unable to load admin dashboard.",
            );
            return;
          }

          setTotalUsers(usersData.meta?.total ?? 0);
          setTotalBookings(Array.isArray(bookingsData) ? bookingsData.length : 0);
        } else {
          const bookingsRes = await fetch(`${bookingUrl}/bookings`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const bookingsData = (await bookingsRes.json().catch(() => [])) as
            | BookingItem[]
            | { message?: string; error?: string };

          if (!bookingsRes.ok) {
            setError(
              (bookingsData as { message?: string; error?: string })?.error ||
                (bookingsData as { message?: string; error?: string })?.message ||
                "Unable to load user dashboard.",
            );
            return;
          }

          const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [];
          const myEmail = user?.email?.toLowerCase();

          const mine = bookingsArray.filter(
            (booking) => booking.email?.toLowerCase() === myEmail,
          );

          setMyBookings(mine.length);
        }
      } catch {
        setError("Something went wrong while loading dashboard.");
      } finally {
        setLoading(false);
      }
    }

    if (userRole) {
      void fetchDashboardData();
    }
  }, [userRole, user?.email]);

  const fullName = useMemo(() => {
    if (!user) return "User";
    return [user.firstName, user.lastName].filter(Boolean).join(" ") || "User";
  }, [user]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <p className="text-sm text-error-500">{error}</p>
      </div>
    );
  }

  if (userRole === "ADMIN") {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Admin Dashboard
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Monitor users, events, and bookings across the system.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 dark:border-white/[0.05] dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
                <GroupIcon className="h-6 w-6" />
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Total Users
              </p>
            </div>
            <p className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white">
              {totalUsers}
            </p>
            <Link
              href="/app-users"
              className="mt-4 inline-block text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View All Users
            </Link>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 dark:border-white/[0.05] dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
                <CalenderIcon className="h-6 w-6" />
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Total Events
              </p>
            </div>
            <p className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white">
              {totalEvents}
            </p>
            <Link
              href="/event-management/view-events"
              className="mt-4 inline-block text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View All Events
            </Link>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 dark:border-white/[0.05] dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
                <ListIcon className="h-6 w-6" />
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Total Bookings
              </p>
            </div>
            <p className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white">
              {totalBookings}
            </p>
            <Link
              href="/booking-management/all-bookings"
              className="mt-4 inline-block text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View All Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Welcome, {fullName}
      </h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Explore events, manage your bookings, and share reviews.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 dark:border-white/[0.05] dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
              <CalenderIcon className="h-6 w-6" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Total Events
            </p>
          </div>
          <p className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white">
            {totalEvents}
          </p>
          <Link
            href="/event-management/view-events"
            className="mt-4 inline-block text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Browse Events
          </Link>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 dark:border-white/[0.05] dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
              <ListIcon className="h-6 w-6" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              My Bookings
            </p>
          </div>
          <p className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white">
            {myBookings}
          </p>
          <Link
            href="/booking-management/my-bookings"
            className="mt-4 inline-block text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View My Bookings
          </Link>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 dark:border-white/[0.05] dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
              <UserCircleIcon className="h-6 w-6" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Upcoming Events
            </p>
          </div>
          <p className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white">
            {upcomingEvents}
          </p>
          <Link
            href="/reviews/booked-events"
            className="mt-4 inline-block text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Go to Reviews
          </Link>
        </div>
      </div>
    </div>
  );
}