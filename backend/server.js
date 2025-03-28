const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const userRoutes = require('./routes/userRoutes');
const http = require("http");
const socketIo = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" },
});

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.log('❌ Error connecting to MongoDB:', err));

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/user', userRoutes);

const Chat = require("./models/Chat");
const Application = require("./models/Application");

const activeUsers = {}; // Track active users

io.on("connection", (socket) => {
  console.log("🔵 User connected:", socket.id);

  // Register user with their ID
  socket.on("register", (userId) => {
    activeUsers[userId] = socket.id;
  });

  // Handle Job Application (Store, but don't add to DM yet)
  socket.on("sendApplication", async ({ senderId, receiverId, jobId, message, counterOffer }) => {
    try {
      const newApplication = new Application({ senderId, receiverId, jobId, message, counterOffer });
      await newApplication.save();
      
      // Notify receiver about application (Optional)
      if (activeUsers[receiverId]) {
        io.to(activeUsers[receiverId]).emit("newApplication", { senderId, jobId, message });
      }
    } catch (error) {
      console.error("Error processing application:", error);
    }
  });

  // Handle Messages (Only add to DM if a message is sent)
  socket.on("sendMessage", async ({ sender, receiver, message }) => {
    try {
      const chatMessage = new Chat({ sender, receiver, message });
      await chatMessage.save();
      
      io.emit("receiveMessage", chatMessage); // Notify all clients

      // Add sender to receiver's DM list if not already there
      io.to(activeUsers[receiver]).emit("addToDM", sender);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected");
    Object.keys(activeUsers).forEach(userId => {
      if (activeUsers[userId] === socket.id) {
        delete activeUsers[userId];
      }
    });
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
