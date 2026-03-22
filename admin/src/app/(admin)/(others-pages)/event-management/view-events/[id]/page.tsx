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

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {event.title}
        </h3>
        <div className="flex items-center gap-2">
          <Link href={`/event-management/edit-event/${event._id}`} className="rounded-lg border border-brand-300 px-3 py-1 text-xs text-brand-600 hover:bg-brand-50">
            Edit
          </Link>
          <Link href="/event-management/view-events" className="rounded-lg border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
            Back
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
        <p><span className="font-medium">ID:</span> {event._id}</p>
        <p><span className="font-medium">Status:</span> {event.status || "-"}</p>
        <p><span className="font-medium">Location:</span> {event.location || "-"}</p>
        <p><span className="font-medium">Seated:</span> {event.isSeated ? "Yes" : "No"}</p>
        <p><span className="font-medium">Start:</span> {new Date(event.start).toLocaleString()}</p>
        <p><span className="font-medium">End:</span> {new Date(event.end).toLocaleString()}</p>
        <p className="md:col-span-2"><span className="font-medium">Description:</span> {event.description || "-"}</p>
        <p className="md:col-span-2"><span className="font-medium">Tags:</span> {event.tags?.join(", ") || "-"}</p>
        
        <div className="md:col-span-2">
          <p className="mb-2"><span className="font-medium">Cover Image:</span></p>
          {event.coverImage ? (
            <img src={event.coverImage} alt={event.title} className="h-48 w-full rounded-lg object-cover" />
          ) : (
            <p className="text-gray-500">-</p>
          )}
        </div>
        
        <div className="md:col-span-2">
          <p className="mb-2"><span className="font-medium">Gallery Images:</span></p>
          {event.galleryImages && event.galleryImages.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {event.galleryImages.map((image, idx) => (
                <img key={idx} src={image} alt={`${event.title} gallery ${idx + 1}`} className="h-32 w-full rounded-lg object-cover" />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">-</p>
          )}
        </div>
      </div>
    </div>
  );
}

