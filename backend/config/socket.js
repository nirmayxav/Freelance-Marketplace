const { Server } = require("socket.io");
const Application = require("./models/Application");

const configureSockets = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Handle job application submission
    socket.on("send_application", async (data) => {
      try {
        const { jobId, applicantId, clientId, message, counterOffer } = data;

        const newApplication = new Application({
          jobId,
          applicantId,
          clientId,
          message,
          counterOffer: counterOffer || null,
          status: "pending",
        });

        await newApplication.save();

        // Notify the client (job poster)
        io.to(clientId.toString()).emit("application_received", newApplication);
      } catch (error) {
        console.error("Error processing application:", error);
      }
    });

    // Handle application status update
    socket.on("update_application_status", async (data) => {
      try {
        const { applicationId, status } = data;
        
        const updatedApplication = await Application.findByIdAndUpdate(
          applicationId,
          { status },
          { new: true }
        );

        if (updatedApplication) {
          // Notify both the freelancer and client
          io.to(updatedApplication.clientId.toString()).emit("application_status_updated", updatedApplication);
          io.to(updatedApplication.applicantId.toString()).emit("application_status_updated", updatedApplication);
        }
      } catch (error) {
        console.error("Error updating application status:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });

  return io;
};

module.exports = configureSockets;
