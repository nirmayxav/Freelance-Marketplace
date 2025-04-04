import React, { useState } from "react";

const ReviewForm = ({ freelancerAddress }) => {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!freelancerAddress) {
      setError("Missing freelancer address.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/reviews/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freelancerAddress, comment, rating }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setComment("");
        setRating(5);
      } else {
        setError(data.error || "Failed to submit review.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return <p className="text-green-600">✅ Review submitted!</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow max-w-md">
      <h2 className="text-xl font-semibold">Leave a Review</h2>

      <textarea
        placeholder="Write your review here..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />

      <div>
        <label>Rating: </label>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="ml-2 border p-1">
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded">
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
};

export default ReviewForm;
