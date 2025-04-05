const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    walletAddress: { type: String, default: null }, // ✅ Added field
    bio: { type: String },
    skills: { type: [String], default: [] },
    image: { type: String, default: "/uploads/default_user_image.jpg" },
    rating: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    moneyReceived: { type: Number, default: 0 },
    moneyInEscrow: { type: Number, default: 0 },
    achievements: [
      {
        title: String,
        description: String,
      },
    ],
    reviews: [
      {
        reviewer: String,
        comment: String,
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving the user
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare entered password with the hashed password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if the model is already defined and use the existing model or define a new one
const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = User;
