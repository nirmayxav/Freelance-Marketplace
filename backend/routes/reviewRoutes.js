const express = require("express");
const router = express.Router();
const { reviewContract } = require("../config/ethers");
// Removed: const authMiddleware = require('../middlewares/authMiddleware');

const Conversation = require("../models/Conversation");
const Chat = require("../models/Chat");
const Timeline = require("../models/Timeline");

// Write review to blockchain
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

// Get all reviews for a freelancer
router.get("/:freelancerAddress", async (req, res) => {
  const { freelancerAddress } = req.params;

  try {
    const rawReviews = await reviewContract.getReviews(freelancerAddress);

    const reviews = rawReviews.map((review) => ({
      comment: review.comment,
      rating: Number(review.rating),
      reviewer: review.reviewer,
    }));

    res.status(200).json({ success: true, reviews });
  } catch (err) {
    console.error("❌ Error fetching reviews:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete conversation and chats
router.delete("/cleanup/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    await Conversation.deleteMany({ jobId });
    await Chat.deleteMany({ jobId });
    res.json({ success: true, message: "Conversation and chats deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Cleanup failed." });
  }
});

// Mark timeline as completed
router.patch("/mark-completed/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    await Timeline.updateMany({ jobId }, { $set: { status: "completed" } });
    res.json({ success: true, message: "Timeline marked completed." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update failed." });
  }
});

module.exports = router;
