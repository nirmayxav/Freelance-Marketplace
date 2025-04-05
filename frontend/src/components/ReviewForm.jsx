import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // Add this at the top


const ReviewForm = () => {
  const location = useLocation();
  const freelancerId = location.state?.freelancerId;
  const navigate = useNavigate();

  // 👉 Hardcoded wallet address
  const freelancerAddress = "0x5eBC4972a4b7eb618a3fF6d385C6E95406999f80";

  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!freelancerAddress) {
      setError("Freelancer has no wallet address linked.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5001/api/reviews/add", {
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
        setError(data.message || data.error || "Failed to submit review.");
      }
    } catch (err) {
      console.error("Review submission error:", err);
      setError("Something went wrong while submitting your review.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={styles.successBox}>
      <p>✅ Review submitted successfully!</p>
      <button onClick={() => navigate("/")} style={styles.homeButton}>
        🏠 Go to Home
      </button>
    </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={styles.container}>
      <h2 style={styles.heading}>💬 Leave a Review</h2>

      <textarea
        placeholder="Write your review..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
        style={styles.textarea}
      />

      <div style={styles.ratingRow}>
        <label style={styles.label}>Rating:</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          style={styles.select}
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} Star{r > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? "Submitting..." : "🚀 Submit Review"}
      </button>
    </form>
  );
};

const styles = {
  container: {
    maxWidth: "500px",
    margin: "0 auto",
    padding: "1rem",
    backgroundColor: "#1e1e2f",
    borderRadius: "12px",
    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
    color: "#fff",
  },
  heading: {
    textAlign: "center",
    marginBottom: "1rem",
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #555",
    resize: "vertical",
    backgroundColor: "#2a2a3d",
    color: "#fff",
  },
  ratingRow: {
    marginTop: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  label: {
    fontWeight: "bold",
  },
  select: {
    padding: "0.5rem",
    borderRadius: "8px",
    backgroundColor: "#2a2a3d",
    color: "#fff",
    border: "1px solid #555",
  },
  button: {
    marginTop: "1rem",
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#4b5fff",
    color: "#fff",
    fontWeight: "bold",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
  error: {
    marginTop: "0.5rem",
    color: "salmon",
  },
  successBox: {
    maxWidth: "500px",
    margin: "2rem auto",
    padding: "1.5rem",
    textAlign: "center",
    backgroundColor: "#1e1e2f",
    color: "#7fff8c",
    border: "1px solid #4bff9e",
    borderRadius: "12px",
  },
};

export default ReviewForm;
