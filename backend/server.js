const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");


// Import models and routes
const User = require("./models/User");
const Chat = require("./models/Chat");
const Application = require("./models/Application");
const Conversation = require("./models/Conversation");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const userRoutes = require("./routes/userRoutes");
const convoRoutes = require('./routes/convoRoutes');
const getInTouchRoutes = require('./routes/GetInTouchRoutes');
const timelineRoutes = require('./routes/timelineRoutes');
const ongoingProjRoutes = require('./routes/ongoingProjRoutes');
const paymentRoutes = require("./routes/paymentRoutes");


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
app.use('/api/getintouch', getInTouchRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/ongoing-projects', ongoingProjRoutes);
app.use("/api/payment", paymentRoutes);

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

  // Send Application event – triggered when an applicant applies

socket.on("sendMessage", async (data) => {
  const { conversationId, sender, receiver, message, counterOffer, jobId } = data;
  
  // Step 1: Log incoming message data
  console.log("📥 Received message data:", data);

  if (!conversationId || !sender || !receiver || !message || !jobId) {
    console.error("❌ Missing message fields:", data);
    return;
  }

  try {
    // Step 2: Create chat message
    console.log("🔄 Creating chat message...");
    const chatMessage = new Chat({
      conversationId,
      sender: mongoose.Types.ObjectId(sender),
      receiver: mongoose.Types.ObjectId(receiver),
      message,
      counterOffer: counterOffer || null,
      jobId: mongoose.Types.ObjectId(jobId),
      timestamp: new Date()
    });
    const savedMessage = await chatMessage.save();
    console.log("✅ Message saved:", savedMessage._id);

    // Step 3: Update conversation with the new message
    console.log("🔄 Updating conversation with new message...");
    await Conversation.findByIdAndUpdate(conversationId, {
      $push: { messages: savedMessage._id },
      lastMessage: savedMessage._id,
      updatedAt: new Date()
    });
    console.log("✅ Conversation updated with new message");

    // Step 4: Emit the message to the receiver (if connected)
    console.log("🔄 Sending message to receiver...");
    const receiverSocketId = activeUsers.get(receiver);
    if (receiverSocketId) {
      console.log("🔔 Emitting message to receiver...");
      io.to(receiverSocketId).emit("receiveMessage", savedMessage);
    }

    // Step 5: Emit the message to the sender (for their own UI)
    console.log("🔄 Sending message to sender...");
    const senderSocketId = activeUsers.get(sender);
    if (senderSocketId) {
      console.log("🔔 Emitting message to sender...");
      io.to(senderSocketId).emit("receiveMessage", savedMessage);
    }

  } catch (error) {
    console.error("❌ Message error:", error);
  }
});

// Send Application event – triggered when an applicant applies
socket.on("sendApplication", async (data) => {
  const { applicantId, clientId, jobId, message, counterOffer } = data;

  // Step 1: Log incoming application data
  console.log("📥 Received application data:", data);

  try {
    // 1. Save the application
    console.log("🔄 Saving application...");
    const newApplication = new Application({
      applicantId: new mongoose.Types.ObjectId(applicantId),  // Correctly instantiate ObjectId
      clientId: new mongoose.Types.ObjectId(clientId),        // Correctly instantiate ObjectId
      jobId: new mongoose.Types.ObjectId(jobId),              // Correctly instantiate ObjectId
      message,
      counterOffer: counterOffer || null, // Ensure counterOffer is passed as null if not provided
      status: "pending"
    });
    const savedApp = await newApplication.save();
    console.log("✅ Application saved:", savedApp);

    // 2. Find or create conversation
    console.log("🔄 Searching for existing conversation...");
    const participants = [applicantId, clientId].sort();
    let conversation = await Conversation.findOne({
      participants: { $all: participants, $size: participants.length }
    });

    if (!conversation) {
      console.log("🔄 No existing conversation found. Creating new conversation...");
      conversation = new Conversation({
        participants,
        jobId: new mongoose.Types.ObjectId(jobId)  // Correctly instantiate ObjectId
      });
      await conversation.save();
      console.log("✅ New conversation created:", conversation._id);
    } else {
      console.log("ℹ️ Conversation already exists:", conversation._id);
    }

    // 3. Create chat message with jobId
    console.log("🔄 Creating chat message with jobId...");
    const chatMessage = new Chat({
      conversationId: conversation._id,
      sender: new mongoose.Types.ObjectId(applicantId), // Correctly instantiate ObjectId
      receiver: new mongoose.Types.ObjectId(clientId),   // Correctly instantiate ObjectId
      message: `📄 Job Application: ${message}`,
      isApplication: true,
      jobId: new mongoose.Types.ObjectId(jobId),         // Correctly instantiate ObjectId
      counterOffer: counterOffer || null,
      timestamp: new Date()
    });
    await chatMessage.save();
    console.log("✅ Chat message saved:", chatMessage);

    // Update conversation with the new message
    console.log("🔄 Updating conversation with new message...");
    await Conversation.findByIdAndUpdate(conversation._id, {
      $push: { messages: chatMessage._id },
      lastMessage: chatMessage._id,
      updatedAt: new Date()
    });
    console.log("✅ Conversation updated with new message");

    // Notify client (receiver) if connected
    console.log("🔄 Checking if client is connected...");
    const clientSocketId = activeUsers.get(clientId);
    if (clientSocketId) {
      console.log("🔔 Sending new application notification to client...");
      io.to(clientSocketId).emit("newApplication", {
        application: savedApp,
        chat: chatMessage
      });
    } else {
      console.log("ℹ️ Client not connected. Skipping notification.");
    }

    // 4. Confirm success to the applicant
    console.log("✅ Application submitted. Confirming success to applicant...");
    socket.emit("application_success", {
      message: "Application submitted!"
    });

  } catch (error) {
    console.error("❌ Application error:", error);
    socket.emit("application_error", error.message);
  }
});

// Create Conversation event
socket.on("createConversation", async (data) => {
  console.log("📥 Received createConversation event:", data);
  const { senderId, receiverId, jobId } = data;

  // Step 1: Log incoming conversation data
  console.log("📥 Received createConversation data:", data);

  if (!senderId || !receiverId) {
    console.error("❌ Missing sender or receiver ID");
    socket.emit("conversation_error", "Invalid sender or receiver ID");
    return;
  }

  try {
    // Step 2: Sort participants and find or create the conversation
    console.log("🔄 Searching for existing conversation...");
    const participants = [senderId, receiverId].sort();
    let conversation = await Conversation.findOne({
      participants: { $all: participants, $size: participants.length }
    });

    if (!conversation) {
      console.log("🔄 No existing conversation found. Creating new conversation...");
      conversation = new Conversation({
        participants,
        jobId: new mongoose.Types.ObjectId(jobId) // Correctly instantiate ObjectId
      });
      await conversation.save();
      console.log("✅ New conversation created:", conversation._id);
    } else {
      console.log("ℹ️ Conversation already exists:", conversation._id);
    }

    // Step 3: Emit success and conversation details
    console.log("✅ Conversation created successfully. Sending success response...");
    socket.emit("conversation_success", { 
      message: "Conversation created!",
      conversationId: conversation._id,
      jobId: new mongoose.Types.ObjectId(jobId) // Correctly instantiate ObjectId
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