const mongoose = require('mongoose');

const TimelineSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Optionally store a job reference if applicable
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },
    paymentMode: {
      type: String,
      enum: ['full', 'milestone', 'hourly'],
      default: 'full',
      required: true,
    },
    totalAmount: {
      type: Number,
    },
    escrowEnabled: {
      type: Boolean,
      default: true,
    },
    milestones: [
      {
        description: { type: String, required: true },
        amount: { type: Number, required: true },
        // This field acts as the "completion criteria" for the milestone
        trigger: { type: String, required: true },
      },
    ],
    // Timeline status: 'proposal' (default), 'accepted', 'in-progress', 'completed'
    status: {
      type: String,
      enum: ['proposal', 'accepted', 'in-progress', 'completed'],
      default: 'proposal',
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Timeline || mongoose.model('Timeline', TimelineSchema);
