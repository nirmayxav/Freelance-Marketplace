const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, default: 'open' },
  skillsRequired: [{ type: String, required: true }],
  timeline: { type: String, required: true },
  fileAttachment: { type: String },
  likes: { type: Number, default: 0 }, // Track the number of likes
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Track users who liked the job
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);