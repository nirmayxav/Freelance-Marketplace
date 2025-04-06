import React, { useEffect, useState } from "react";

const ReviewList = ({ freelancerAddress }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!freelancerAddress) return;
  
    const fetchReviews = async () => {
      console.log("🔄 Fetching reviews for:", freelancerAddress);
      try {
        const res = await fetch(`/api/reviews/${freelancerAddress}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setReviews(data.reviews);
          console.log("✅ Reviews fetched:", data.reviews);
        } else {
          console.error("🧨 Failed response:", data);
        }
      } catch (err) {
        console.error("❌ Error fetching reviews:", err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchReviews();
  }, [freelancerAddress]);
  

  if (loading) return <p>Loading reviews...</p>;
  if (!reviews.length) return <p>No reviews yet.</p>;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold mb-2">⭐ Reviews</h2>
      {reviews.map((review, i) => (
        <div key={i} className="p-3 border rounded bg-gray-50">
          <p className="font-medium">{review.comment}</p>
          <p className="text-sm text-gray-600">Rating: {review.rating} ⭐</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
