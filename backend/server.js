const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const multer = require("multer");
const path = require("path");

// Import models and routes
const User = require("./models/User");
const Chat = require("./models/Chat");
const Application = require("./models/Application");
const Conversation = require("./models/Conversation");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" },
});

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads")); // Serve uploaded images

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ Error connecting to MongoDB:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/user", userRoutes);
const activeUsers = {}; // Track active users

io.on("connection", (socket) => {
  console.log("🔵 User connected:", socket.id);

  socket.on("register", (userId) => {
    console.log("✅ Registered user:", userId);
    activeUsers[userId] = socket.id;
  });

  socket.on("sendApplication", async ({ applicantId, clientId, jobId, message, counterOffer }) => {
    console.log("📩 Received sendApplication event:", { applicantId, clientId, jobId, message, counterOffer });

    try {
      if (!applicantId || !clientId || !jobId || !message) {
        console.error("❌ Missing required fields:", { applicantId, clientId, jobId, message });
        return;
      }

      // Validate ObjectId format before conversion
      if (
        !mongoose.Types.ObjectId.isValid(applicantId) ||
        !mongoose.Types.ObjectId.isValid(clientId) ||
        !mongoose.Types.ObjectId.isValid(jobId)
      ) {
        console.error("❌ Invalid ObjectId format:", { applicantId, clientId, jobId });
        return;
      }

      const newApplication = new Application({
        applicantId: new mongoose.Types.ObjectId(applicantId),
        clientId: new mongoose.Types.ObjectId(clientId),
        jobId: new mongoose.Types.ObjectId(jobId),
        message,
        counterOffer,
        status: "pending", // Default status
      });

      await newApplication.save();

      console.log("✅ Job application saved:", newApplication);

      if (activeUsers[clientId]) {
        io.to(activeUsers[clientId]).emit("newApplication", { applicantId, jobId, message, counterOffer, status: "pending" });
      }
    } catch (error) {
      console.error("❌ Error processing application:", error);
    }
  });

  socket.on("sendMessage", async ({ sender, receiver, message }) => {
    console.log("💬 Received sendMessage event:", { sender, receiver, message });

    try {
      const chatMessage = new Chat({ sender, receiver, message });
      await chatMessage.save();

      console.log("✅ Chat message saved:", chatMessage);

      io.emit("receiveMessage", chatMessage);

      if (activeUsers[receiver]) {
        io.to(activeUsers[receiver]).emit("addToDM", sender);
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  });

  socket.on("createConversation", async ({ senderId, receiverId }) => {
    console.log("🔄 Received createConversation event:", { senderId, receiverId });

    try {
      let conversation = await Conversation.findOne({ participants: { $all: [senderId, receiverId] } });

      if (!conversation) {
        conversation = new Conversation({ participants: [senderId, receiverId], messages: [] });
        await conversation.save();
      }

      console.log("✅ Conversation created:", conversation);

      io.to(senderId).emit("newConversation", conversation);
      io.to(receiverId).emit("newConversation", conversation);
    } catch (error) {
      console.error("❌ Error creating conversation:", error);
    }
  });

  socket.on("disconnect", () => {
    Object.keys(activeUsers).forEach((userId) => {
      if (activeUsers[userId] === socket.id) {
        delete activeUsers[userId];
      }
    });
  });
});

// Multer Setup for Profile Picture Upload
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// API Endpoint for Profile Picture Upload
app.post("/api/user/uploadProfile", upload.single("profilePhoto"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const userId = req.body.userId;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.profilePhoto = `/uploads/${req.file.filename}`;
    await user.save();

    io.emit("profileUpdated", { userId, profilePhoto: user.profilePhoto });

    res.json({ message: "Profile picture updated successfully", profilePhoto: user.profilePhoto });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
