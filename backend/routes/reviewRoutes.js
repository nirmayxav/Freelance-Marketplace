const express = require("express");
const router = express.Router();
const { reviewContract } = require("../config/ethers");

// @route   POST /api/reviews/add
// @desc    Add a review to the blockchain
router.post("/add", async (req, res) => {
  const { freelancerAddress, comment, rating } = req.body;

  try {
    const tx = await reviewContract.addReview(freelancerAddress, comment, rating);
    await tx.wait();

    res.status(200).json({
      success: true,
      message: "Review successfully written to blockchain!",
      txHash: tx.hash,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error writing review to blockchain",
      error: err.message,
    });
  }
});

// @route   GET /api/reviews/:freelancerAddress
// @desc    Get all reviews for a freelancer
router.get("/:freelancerAddress", async (req, res) => {
  const { freelancerAddress } = req.params;

  try {
    const reviews = await reviewContract.getReviews(freelancerAddress);
    res.status(200).json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
