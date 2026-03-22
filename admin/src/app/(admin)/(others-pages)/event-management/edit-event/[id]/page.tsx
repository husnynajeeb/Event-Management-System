"use client";

import React, { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getAuthTokenFromCookie } from "@/lib/authClient";
import { getEventServiceUrl } from "@/lib/eventClient";

type EventStatus = "active" | "cancelled" | "completed";
type SeatType = "VIP" | "Regular" | "Balcony" | "Economy";
type Seat = {
  row: number;
  column: number;
  type?: SeatType;
  price?: number;
};

type EventDetail = {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
  status?: EventStatus;
  tags?: string[];
  isSeated?: boolean;
  seats?: Seat[];
  coverImage?: string;
  galleryImages?: string[];
};

function toDateTimeLocal(value: string) {
  const d = new Date(value);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}

export default function EditEventPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [status, setStatus] = useState<EventStatus>("active");
  const [tags, setTags] = useState("");
  const [isSeated, setIsSeated] = useState(true);
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [seatType, setSeatType] = useState<SeatType>("Regular");
  const [seatPrice, setSeatPrice] = useState(2000);
  const [coverImage, setCoverImage] = useState("");
  const [galleryImages, setGalleryImages] = useState("");

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
        setTitle(data.title || "");
        setDescription(data.description || "");
        setLocation(data.location || "");
        setStart(toDateTimeLocal(data.start));
        setEnd(toDateTimeLocal(data.end));
        setStatus(data.status || "active");
        setTags((data.tags || []).join(", "));
        setIsSeated(data.isSeated ?? true);
        if (data.seats && data.seats.length > 0) {
          const maxRow = Math.max(...data.seats.map((seat) => seat.row || 1));
          const maxCol = Math.max(...data.seats.map((seat) => seat.column || 1));
          setRows(maxRow);
          setCols(maxCol);
          setSeatType((data.seats[0].type as SeatType) || "Regular");
          setSeatPrice(data.seats[0].price || 2000);
        }
        setCoverImage(data.coverImage || "");
        setGalleryImages((data.galleryImages || []).join(", "));
      } catch {
        setError("Something went wrong while fetching event.");
      } finally {
        setLoading(false);
      }
    }
    void loadEvent();
  }, [id]);

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

      const payload = {
        title,
        description,
        location,
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
        status,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        isSeated,
        rows: isSeated ? rows : undefined,
        cols: isSeated ? cols : undefined,
        seatType: isSeated ? seatType : undefined,
        seatPrice: isSeated ? seatPrice : undefined,
        coverImage,
        galleryImages: galleryImages
          .split(",")
          .map((img) => img.trim())
          .filter(Boolean),
      };

      const res = await fetch(`${getEventServiceUrl()}/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setError(data.message || "Failed to update event.");
        return;
      }
      setSuccess("Event updated successfully.");
      setTimeout(() => router.push(`/event-management/view-events/${id}`), 800);
    } catch {
      setError("Something went wrong while updating event.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-gray-500 dark:text-gray-400">Loading event...</p>;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Edit Event
        </h3>
        <Link href={`/event-management/view-events/${id}`} className="rounded-lg border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
          Back
        </Link>
      </div>

      <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Title</label>
          <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Location</label>
          <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-gray-500">Description</label>
          <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Start</label>
          <input type="datetime-local" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" value={start} onChange={(e) => setStart(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">End</label>
          <input type="datetime-local" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" value={end} onChange={(e) => setEnd(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Status</label>
          <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" value={status} onChange={(e) => setStatus(e.target.value as EventStatus)}>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Tags</label>
          <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500" placeholder="Comma separated tags" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={isSeated} onChange={(e) => setIsSeated(e.target.checked)} />
            Seated Event
          </label>
        </div>
        {isSeated && (
          <>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Rows</label>
              <input type="number" min={1} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" value={rows} onChange={(e) => setRows(Number(e.target.value))} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Columns</label>
              <input type="number" min={1} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" value={cols} onChange={(e) => setCols(Number(e.target.value))} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Seat Type</label>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" value={seatType} onChange={(e) => setSeatType(e.target.value as SeatType)}>
                <option value="VIP">VIP</option>
                <option value="Regular">Regular</option>
                <option value="Balcony">Balcony</option>
                <option value="Economy">Economy</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Seat Price</label>
              <input type="number" min={0} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" value={seatPrice} onChange={(e) => setSeatPrice(Number(e.target.value))} />
            </div>
          </>
        )}
        <div>
          <label className="mb-1 block text-xs text-gray-500">Cover Image URL</label>
          <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500" placeholder="https://..." value={coverImage} onChange={(e) => setCoverImage(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Gallery Image URLs</label>
          <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500" placeholder="Comma separated image URLs" value={galleryImages} onChange={(e) => setGalleryImages(e.target.value)} />
        </div>

        {error && <p className="text-sm text-error-500 md:col-span-2">{error}</p>}
        {success && <p className="text-sm text-success-600 md:col-span-2">{success}</p>}

        <button type="submit" disabled={saving} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60">
          {saving ? "Saving..." : "Update Event"}
        </button>
      </form>
    </div>
  );
}

