const mongoose = require('mongoose');

const GetInTouchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.GetInTouch || mongoose.model('GetInTouch', GetInTouchSchema);
