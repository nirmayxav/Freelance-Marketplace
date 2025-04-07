import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ReviewForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const freelancerId = location.state?.freelancerId;
  const jobId = location.state?.jobId;

  const [freelancerAddress, setFreelancerAddress] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(7);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWallet = async () => {
      if (!freelancerId) return setError("Missing freelancer ID.");
     
  try {
    const res = await fetch(`http://localhost:5001/api/wallets/${freelancerId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

        const data = await res.json();
        setFreelancerAddress(data.walletAddress);
      } catch (err) {
        setError("Failed to fetch freelancer wallet address.");
      }
    };

    fetchWallet();
  }, [freelancerId]);

  useEffect(() => {
    let timer;
    if (submitted && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      navigate("/homes");
    }
    return () => clearTimeout(timer);
  }, [submitted, countdown, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!freelancerAddress) return setError("Freelancer has no wallet address linked.");

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5001/api/reviews/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freelancerAddress, comment, rating }),
      });

      const data = await res.json();
      if (data.success) {
        // Clean up: delete conversation, chats, update timeline
        const token = localStorage.getItem("token");

        await fetch(`http://localhost:5001/api/reviews/cleanup/${jobId}`, {
          method: "DELETE"
        });
        

        await fetch(`http://localhost:5001/api/reviews/mark-completed/${jobId}`, {
          method: "PATCH"
        });

        setSubmitted(true);
        setComment("");
        setRating(5);
      } else {
        setError(data.message || "Failed to submit review.");
      }
    } catch (err) {
      console.error("❌ Review submission error:", err);
      setError("Something went wrong while submitting your review.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="success-box">
        <p>✅ Review submitted successfully!</p>
        <p>🔁 Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h2>📝 Leave a Review</h2>
      <textarea
        placeholder="Your review..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
      />
      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      >
        {[5, 4, 3, 2, 1].map((r) => (
          <option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>
        ))}
      </select>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
};

export default ReviewForm;
