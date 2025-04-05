const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  visibleToApplicant: { type: Boolean, default: false },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' } // Added reference to Application
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
