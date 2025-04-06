import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
const ReviewForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const freelancerId = location.state?.freelancerId;

  const [freelancerAddress, setFreelancerAddress] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWallet = async () => {
      console.log("📡 Fetching wallet address for freelancerId:", freelancerId);

      if (!freelancerId) {
        setError("Missing freelancer ID.");
        return;
      }

      try {
        const res = await fetch(`http://localhost:5001/api/wallet/${freelancerId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const contentType = res.headers.get("content-type");
        if (!res.ok) {
          const text = await res.text();
          console.error("❌ Wallet fetch failed with HTML:", text);
          throw new Error(`Status ${res.status} - Not JSON`);
        }

        if (!contentType.includes("application/json")) {
          throw new Error("Expected JSON response from backend.");
        }

        const data = await res.json();
        console.log("✅ Wallet address fetched:", data.walletAddress);
        setFreelancerAddress(data.walletAddress);
      } catch (err) {
        console.error("❌ Error fetching wallet address:", err);
        setError("Failed to fetch freelancer wallet address.");
      }
    };

    fetchWallet();
  }, [freelancerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!freelancerAddress) {
      setError("Freelancer has no wallet address linked.");
      return;
    }

    try {
      setLoading(true);
      console.log("🚀 Submitting review to blockchain...");
      const res = await fetch("http://localhost:5001/api/reviews/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freelancerAddress, comment, rating }),
      });

      const data = await res.json();
      if (data.success) {
        console.log("✅ Review submitted successfully:", data);
        setSubmitted(true);
        setComment("");
        setRating(5);
        setTimeout(() => navigate("/homes"), 4500); // ✅ navigate to home page

      } else {
        console.warn("⚠️ Review submission failed:", data);
        setError(data.message || data.error || "Failed to submit review.");
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
