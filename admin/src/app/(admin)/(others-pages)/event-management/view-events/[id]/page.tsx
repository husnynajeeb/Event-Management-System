"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getEventServiceUrl } from "@/lib/eventClient";

type EventDetail = {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
  status?: string;
  tags?: string[];
  isSeated?: boolean;
  coverImage?: string;
  galleryImages?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export default function ViewSingleEventPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentGallerySlide, setCurrentGallerySlide] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);
  }, []);

  useEffect(() => {
    async function loadEvent() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await fetch(`${getEventServiceUrl()}/events/${id}`);
        const data = (await res.json().catch(() => ({}))) as EventDetail & { message?: string };
        if (!res.ok) {
          setError(data.message || "Failed to fetch event.");
          return;
        }
        setEvent(data);
      } catch {
        setError("Something went wrong while fetching event.");
      } finally {
        setLoading(false);
      }
    }
    void loadEvent();
  }, [id]);

  if (loading) return <p className="text-sm text-gray-500 dark:text-gray-400">Loading event...</p>;
  if (error) return <p className="text-sm text-error-500">{error}</p>;
  if (!event) return <p className="text-sm text-gray-500 dark:text-gray-400">Event not found.</p>;

  const galleryImages = event.galleryImages && event.galleryImages.length > 0 
    ? event.galleryImages 
    : [];

  const isAdmin = userRole === "ADMIN";

  const nextGallerySlide = () => {
    setCurrentGallerySlide((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const prevGallerySlide = () => {
    setCurrentGallerySlide((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const goToGallerySlide = (index: number) => {
    setCurrentGallerySlide(index);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Facebook-style Cover Image */}
      {event.coverImage && (
        <div className="relative w-full bg-gray-900">
          <div className="relative h-64 w-full overflow-hidden sm:h-80 md:h-96 lg:h-[420px]">
            <img
              src={event.coverImage}
              alt={event.title}
              className="h-full w-full object-cover"
            />
            {/* Dark overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        </div>
      )}

      {/* Main Content - Full Width */}
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:p-8">
          {/* Header Section */}
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {event.title}
            </h1>
            <div className="flex w-full items-center gap-3 sm:w-auto">
              {/* Edit Button - Only for Admins */}
              {isAdmin && (
                <Link
                  href={`/event-management/edit-event/${event._id}`}
                  className="flex-1 rounded-lg border border-brand-300 px-4 py-2 text-center text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-900/20 sm:flex-initial"
                >
                  Edit
                </Link>
              )}
              {/* Back Button - Always visible */}
              <Link
                href="/event-management/view-events"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 sm:flex-initial"
              >
                Back
              </Link>
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Event Information
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Event ID
                  </p>
                  <p className="mt-1 break-all text-sm font-medium text-gray-900 dark:text-white">
                    {event._id}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Status
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                        event.status === "active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : event.status === "completed"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {event.status || "-"}
                    </span>
                  </p>
                </div>

                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Location
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                    {event.location || "-"}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Seated
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                    {event.isSeated ? "Yes" : "No"}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Start Date
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(event.start).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    End Date
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(event.end).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div>
                <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Description
                </h2>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {event.description}
                  </p>
                </div>
              </div>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery Slider */}
            {galleryImages.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Gallery
                </h2>
                
                {/* Slider Container */}
                <div className="relative w-full bg-gray-900 rounded-xl overflow-hidden">
                  {/* Main Image Display */}
                  <div className="relative h-96 w-full overflow-hidden">
                    {galleryImages.map((image, idx) => (
                      <div
                        key={idx}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                          idx === currentGallerySlide ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${event.title} gallery ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}

                    {/* Dark overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>

                  {/* Slider Controls - Only show if more than 1 image */}
                  {galleryImages.length > 1 && (
                    <>
                      {/* Left Arrow */}
                      <button
                        onClick={prevGallerySlide}
                        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/70 p-2 transition-all hover:bg-white dark:bg-black/40 dark:hover:bg-black/60"
                        aria-label="Previous image"
                      >
                        <svg
                          className="h-6 w-6 text-gray-900 dark:text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>

                      {/* Right Arrow */}
                      <button
                        onClick={nextGallerySlide}
                        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/70 p-2 transition-all hover:bg-white dark:bg-black/40 dark:hover:bg-black/60"
                        aria-label="Next image"
                      >
                        <svg
                          className="h-6 w-6 text-gray-900 dark:text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>

                      {/* Slide counter */}
                      <div className="absolute right-4 top-4 z-20 rounded-full bg-black/50 px-3 py-1 text-sm font-medium text-white">
                        {currentGallerySlide + 1} / {galleryImages.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnail Navigation */}
                {galleryImages.length > 1 && (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                    {galleryImages.map((image, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToGallerySlide(idx)}
                        className={`h-20 min-w-20 flex-shrink-0 rounded-lg border-2 overflow-hidden transition-all ${
                          idx === currentGallerySlide
                            ? "border-brand-500 ring-2 ring-brand-500"
                            : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Dot Indicators */}
                {galleryImages.length > 1 && (
                  <div className="mt-4 flex justify-center gap-2">
                    {galleryImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToGallerySlide(idx)}
                        className={`h-2 rounded-full transition-all ${
                          idx === currentGallerySlide
                            ? "w-8 bg-brand-500"
                            : "w-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}