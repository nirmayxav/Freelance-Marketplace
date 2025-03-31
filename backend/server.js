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
const convoRoutes = require('./routes/convoRoutes');



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
app.use("/api/conversations", convoRoutes);
const activeUsers = new Map();

io.on("connection", (socket) => {
  console.log("🔵 User connected:", socket.id);

  // Authentication
  socket.on("authenticate", (token) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("❌ Authentication failed:", err);
        socket.emit("authentication_error", "Invalid token");
        return;
      }
      console.log("✅ Authenticated user:", decoded.userId);
      activeUsers.set(decoded.userId, socket.id);
      socket.emit("authenticated", { userId: decoded.userId });
    });
  });

  // Handle job applications
  socket.on("sendApplication", async (data) => {
    const { applicantId, clientId, jobId, message, counterOffer } = data;
    try {
      // 1. Save the application
      const newApplication = new Application({
        applicantId: new mongoose.Types.ObjectId(applicantId),
        clientId: new mongoose.Types.ObjectId(clientId),
        jobId: new mongoose.Types.ObjectId(jobId),
        message,
        counterOffer,
        status: "pending"
      });
      const savedApp = await newApplication.save();

      // 2. Find or create conversation using sorted participants
      const participants = [applicantId, clientId].sort();
      let conversation = await Conversation.findOne({
        participants: { $all: participants, $size: participants.length }
      });
      if (!conversation) {
        conversation = new Conversation({ participants });
        await conversation.save();
      }

      // 3. Create automatic chat message with application details
      const chatMessage = new Chat({
        conversationId: conversation._id,
        sender: applicantId,
        receiver: clientId,
        message: `📄 Job Application: ${message}`,
        isApplication: true,
        jobId: jobId,
        counterOffer: counterOffer,
        timestamp: new Date()
      });
      await chatMessage.save();

      // Update conversation with the new message
      await Conversation.findByIdAndUpdate(conversation._id, {
        $push: { messages: chatMessage._id },
        lastMessage: chatMessage._id,
        updatedAt: new Date()
      });

      // 4. Notify the client if connected
      const clientSocketId = activeUsers.get(clientId);
      if (clientSocketId) {
        io.to(clientSocketId).emit("newApplication", {
          application: savedApp,
          chat: chatMessage
        });
      }

      // 5. Confirm success to the applicant
      socket.emit("application_success", {
        message: "Application submitted!",
        chat: chatMessage
      });
    } catch (error) {
      console.error("Application error:", error);
      socket.emit("application_error", error.message);
    }
  });

  // Handle private messages
  socket.on("sendMessage", async (data) => {
    const { conversationId, sender, receiver, message } = data;
    if (!conversationId || !sender || !receiver || !message) {
      console.error("❌ Missing message fields");
      return;
    }
    try {
      // Create and save the chat message with conversationId
      const chatMessage = new Chat({
        conversationId,
        sender,
        receiver,
        message,
        timestamp: new Date()
      });
      const savedMessage = await chatMessage.save();
      console.log("💬 Message saved:", savedMessage._id);

      // Update the conversation document with the new message
      await Conversation.findByIdAndUpdate(conversationId, {
        $push: { messages: savedMessage._id },
        lastMessage: savedMessage._id,
        updatedAt: new Date()
      });

      // Emit the message to receiver and sender
      const receiverSocketId = activeUsers.get(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", savedMessage);
      }
      const senderSocketId = activeUsers.get(sender);
      if (senderSocketId) {
        io.to(senderSocketId).emit("receiveMessage", savedMessage);
      }
    } catch (error) {
      console.error("❌ Message error:", error);
    }
  });

  // Handle conversation creation
  socket.on("createConversation", async (data) => {
    console.log("📥 Received createConversation event:", data);
    const { senderId, receiverId } = data;
    if (!senderId || !receiverId) {
      console.error("❌ Missing sender or receiver ID");
      socket.emit("conversation_error", "Invalid sender or receiver ID");
      return;
    }
    try {
      // Sort to ensure unique ordering
      const participants = [senderId, receiverId].sort();
      let conversation = await Conversation.findOne({
        participants: { $all: participants, $size: participants.length }
      });
      if (!conversation) {
        console.log("🔄 Creating new conversation...");
        conversation = new Conversation({ participants });
        await conversation.save();
        console.log("✅ Conversation saved:", conversation._id);
      } else {
        console.log("ℹ️ Conversation already exists:", conversation._id);
      }
      socket.emit("conversation_success", { 
        message: "Conversation created!",
        conversationId: conversation._id 
      });
    } catch (error) {
      console.error("❌ Conversation error:", error);
      socket.emit("conversation_error", error.message);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    for (let [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        console.log("🔴 User disconnected:", userId);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});