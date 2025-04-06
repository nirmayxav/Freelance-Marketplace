const express = require("express");
const router = express.Router();
const { reviewContract } = require("../config/ethers");

// POST /api/reviews/add
router.post("/add", async (req, res) => {
  const { freelancerAddress, comment, rating } = req.body;

  if (!freelancerAddress || !comment || typeof rating !== "number" || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Invalid review data." });
  }

  try {
    const tx = await reviewContract.addReview(freelancerAddress, comment, rating);
    await tx.wait();

    res.status(200).json({
      success: true,
      message: "Review successfully written to blockchain!",
      txHash: tx.hash,
    });
  } catch (err) {
    console.error("❌ Error writing review:", err.reason || err.message || err);
    res.status(500).json({
      success: false,
      message: "Error writing review to blockchain.",
      error: err.message || "Unknown error",
    });
  }
});

// @route   GET /api/reviews/:freelancerAddress
// @desc    Get all reviews for a freelancer
router.get("/:freelancerAddress", async (req, res) => {
  const { freelancerAddress } = req.params;
  console.log("🔍 Fetching reviews for:", freelancerAddress);

  try {
    const rawReviews = await reviewContract.getReviews(freelancerAddress);
    console.log("✅ Raw reviews from contract:", rawReviews);

    // 🔄 Convert BigInt fields to numbers or strings
    const reviews = rawReviews.map((review) => ({
      comment: review.comment,
      rating: Number(review.rating), // Convert BigInt to Number
      reviewer: review.reviewer,
    }));

    res.status(200).json({ success: true, reviews });
  } catch (err) {
    console.error("❌ Error fetching reviews:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;
