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

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const getToken = () => {
    return getAuthTokenFromCookie();
  };

  const getCurrentUserInfo = useCallback(() => {
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

  useEffect(() => {
    getCurrentUserInfo();
  }, [getCurrentUserInfo]);

  const loadReviews = useCallback(async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      const res = await fetch(`http://localhost:3001/reviews/${eventId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch reviews: ${res.status}`);
      }

      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const myReview = currentUser
    ? reviews.find((review) => review.user_id === currentUser.id)
    : null;

  useEffect(() => {
    if (myReview && !editingReviewId) {
      setRating(myReview.rating);
      setComment(myReview.comment || "");
    }
  }, [myReview, editingReviewId]);

  const handleSubmitReview = async () => {
    if (!eventId) return;

    try {
      setSubmitting(true);
      setError(null);

      const token = getToken();
      if (!token) {
        setError("You are not signed in.");
        return;
      }

      const payload = {
        event_id: eventId,
        rating,
        comment,
      };

      const isEditing = !!editingReviewId;

      const res = await fetch(
        isEditing
          ? `http://localhost:3001/reviews/${editingReviewId}`
          : `http://localhost:3001/reviews`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to save review.");
      }

      setComment("");
      setRating(5);
      setEditingReviewId(null);
      await loadReviews();
      alert(isEditing ? "✅ Review updated successfully!" : "✅ Review added successfully!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReviewId(review._id);
    setRating(review.rating);
    setComment(review.comment || "");
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setRating(myReview?.rating || 5);
    setComment(myReview?.comment || "");
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }

    setDeleting(reviewId);

    try {
      const token = getToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`http://localhost:3001/reviews/${reviewId}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Delete failed: ${res.status}`);
      }

      setReviews((prev) => prev.filter((r) => r._id !== reviewId));

      if (editingReviewId === reviewId) {
        setEditingReviewId(null);
        setComment("");
        setRating(5);
      }

      alert("✅ Review deleted successfully!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(`❌ Error: ${message}`);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Loading reviews...</p>;
  }

  if (error) {
    return <p className="text-sm text-error-500">{error}</p>;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Event Reviews
        </h3>
        <Link
          href="/reviews/booked-events"
          className="rounded-lg border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Back
        </Link>
      </div>

      {currentUser && (
        <div className="mb-6 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
          <h4 className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">
            {editingReviewId ? "Edit Your Review" : myReview ? "Update Your Review" : "Write a Review"}
          </h4>

          <div className="mb-3">
            <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">
              Rating
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Good</option>
              <option value={3}>3 - Average</option>
              <option value={2}>2 - Poor</option>
              <option value={1}>1 - Very Poor</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Write your review here..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmitReview}
              disabled={submitting}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {submitting
                ? editingReviewId
                  ? "Updating..."
                  : "Submitting..."
                : editingReviewId
                ? "Update Review"
                : myReview
                ? "Update Review"
                : "Submit Review"}
            </button>

            {editingReviewId && (
              <button
                onClick={handleCancelEdit}
                type="button"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No reviews found for this event.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, idx) => {
            const canModify =
              currentUser &&
              (review.user_id === currentUser.id || currentUser.role === "ADMIN");

            return (
              <div
                key={review._id || idx}
                className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md dark:border-gray-700"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {review.user_name}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm text-brand-600 dark:text-brand-400">
                        {"⭐".repeat(review.rating)}
                        <span className="ml-1 text-gray-400">{review.rating}/5</span>
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {review.comment}
                </p>

                {canModify && (
                  <div className="flex justify-end gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
                    {review.user_id === currentUser?.id && (
                      <button
                        onClick={() => handleEditReview(review)}
                        className="rounded px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition"
                      >
                        Edit
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      disabled={deleting === review._id}
                      className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleting === review._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Total Reviews:{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {reviews.length}
          </span>
        </p>
      </div>
    </div>
  );
}