"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getAuthTokenFromCookie } from "@/lib/authClient";

type Review = {
  _id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type CurrentUser = {
  id: string;
  role: string;
} | null;

export default function EventReviewsPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params?.eventId;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Get token from auth cookie/localStorage
  const getToken = () => {
    const token = getAuthTokenFromCookie();
    console.log("Token found:", !!token, "Value:", token ? token.substring(0, 20) + "..." : "none");
    return token;
  };

  // Ensure component is mounted (avoid SSR issues)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get current user info from JWT token
  const getCurrentUserInfo = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setCurrentUser(null);
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUser({
        id: payload.id || payload.sub,
        role: payload.role || "USER",
      });
    } catch {
      setCurrentUser(null);
    }
  }, []);

  // Load current user on mount
  useEffect(() => {
    getCurrentUserInfo();
  }, [getCurrentUserInfo]);

  useEffect(() => {
    async function loadReviews() {
      if (!eventId) return;
      try {
        setLoading(true);
        const token = getToken();
        const res = await fetch(`http://localhost:3001/reviews/${eventId}`, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`Failed to fetch reviews: ${res.status}`);
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, [eventId]);

  // Delete review handler
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }

    setDeleting(reviewId);
    try {
      const token = getToken();
      console.log("Delete attempt - Token:", token ? "EXISTS" : "MISSING");
      
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        console.log("Authorization header set");
      } else {
        console.log("WARNING: No token found!");
      }

      console.log("Sending DELETE to:", `http://localhost:3001/reviews/${reviewId}`);
      console.log("Headers:", Object.keys(headers));

      const res = await fetch(`http://localhost:3001/reviews/${reviewId}`, {
        method: "DELETE",
        headers,
      });

      console.log("Delete response status:", res.status);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Delete failed: ${res.status}`);
      }

      // Remove from local state
      setReviews(reviews.filter((r) => r._id !== reviewId));
      alert("✅ Review deleted successfully!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Delete error:", message);
      alert(`❌ Error: ${message}`);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <p className="text-sm text-gray-500 dark:text-gray-400">Loading reviews...</p>;
  if (error) return <p className="text-sm text-error-500">{error}</p>;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Event Reviews</h3>
        <Link
          href="/reviews/booked-events"
          className="rounded-lg border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Back
        </Link>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No reviews found for this event.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, idx) => (
            <div
              key={review._id || idx}
              className="border border-gray-200 rounded-lg p-4 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{review.user_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-brand-600 dark:text-brand-400">
                      {"⭐".repeat(review.rating)}
                      <span className="text-gray-400 ml-1">{review.rating}/5</span>
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{review.comment}</p>

              {/* Delete Button - Always shown for testing */}
              <div className="flex gap-2 pt-3 justify-end border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleDeleteReview(review._id)}
                  disabled={deleting === review._id}
                  className="rounded px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete this review"
                >
                  {deleting === review._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Total Reviews: <span className="font-semibold text-gray-700 dark:text-gray-300">{reviews.length}</span>
        </p>
      </div>
    </div>
  );
}
