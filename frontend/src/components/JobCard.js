import React, { useState, useEffect } from "react";
import './JobCard.css'; // optional: if you want styling

// Ensure the socket instance is imported from a common module
import { socket } from "./socket"; // e.g., from

const JobCard = ({ job, currentUser, onLike }) => {
  const [likes, setLikes] = useState(job?.likes || 0);
  const [showPopup, setShowPopup] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [counterOffer, setCounterOffer] = useState("");

  useEffect(() => {
    if (currentUser) {
      // Use currentUser.id as stored in localStorage
      socket.emit("register", currentUser.id);
    }
    return () => socket.disconnect();
  }, [currentUser]);

  const handleLike = async () => {
    if (isLiked) return alert("You already liked this job!");

    try {
      const response = await fetch(`/api/jobs/${job?._id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Error liking job.");

      setLikes((prevLikes) => prevLikes + 1);
      setIsLiked(true);
      if (onLike) onLike(job._id);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleApplySubmit = () => {
    if (!currentUser || !currentUser.id)
      return alert("You must be logged in to apply.");
    if (!job || !job._id) return alert("Invalid job data.");
    if (!applyMessage.trim()) return alert("Message cannot be empty.");
    if (currentUser.id === job.client._id) {
      return alert("You cannot apply to your own job.");
    }
    
    // Ensure socket is connected
    if (!socket.connected) {
      console.warn("⚠️ Socket not connected. Connecting now...");
      socket.connect(); // Manually connect if not already connected
    }
  
    // Wait for socket to connect before emitting events
    socket.once("connect", () => {
      console.log("✅ Socket connected, proceeding with application...");
  
      const applicationData = {
        applicantId: currentUser.id,
        clientId: job.client._id,
        jobId: job._id, // Include jobId in the application data
        message: applyMessage,
        counterOffer: counterOffer || job.budget,
        status: "pending",
      };
  
      console.log("🚀 Emitting sendApplication event:", applicationData);
      socket.emit("sendApplication", applicationData);
  
      console.log("📩 Emitting createConversation event:", {
        senderId: currentUser.id,
        receiverId: job.client._id,
        jobId: job._id, // Include jobId in the create conversation event
      });
      socket.emit("createConversation", {
        senderId: currentUser.id,
        receiverId: job.client._id,
        jobId: job._id, // Send jobId when creating conversation
      });
  
      alert("Application sent successfully! Chat has been created.");
      setShowPopup(false);
      setApplyMessage("");
      setCounterOffer("");
    });
  };
  
  
  const handleShare = () => {
    setShowSharePopup(true);
  };

  const shareToWhatsApp = () => {
    const text = `Check out this job: ${job?.title}\n${job?.description}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const shareToX = () => {
    const text = `Check out this job: ${job?.title}\n${job?.description}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Job link copied to clipboard!");
  };

  return (
    <div className="freelance-card-glass">
    {job?.fileAttachment && (
      <img src={job.fileAttachment} alt={job.title} className="freelance-card-img" />
    )}
  
    <div className="freelance-card-body">
      <h3 className="freelance-card-title">{job?.title}</h3>
      <p className="freelance-card-desc">{job?.description}</p>
  
      <div className="freelance-skill-chips">
        {job?.skillsRequired?.map((skill, index) => (
          <span className="freelance-skill-chip" key={index}>{skill}</span>
        ))}
      </div>
  
      <div className="freelance-meta-info">
        <span>💰 ${job?.budget}</span>
        <span>⏳ {job?.timeline}</span>
        <span>❤️ {likes} Likes</span>
      </div>
  
      {/* ✅ All buttons in same row */}
      <div className="freelance-btn-group">
        <button className={`freelance-like-btn ${isLiked ? "freelance-liked" : ""}`} onClick={handleLike}>
          {isLiked ? "✅ Liked" : "❤️ Like"}
        </button>
        <button className="freelance-share-btn" onClick={handleShare}>
          📤 Share
        </button>
        <button className="freelance-apply-btn" onClick={() => setShowPopup(true)}>
          🚀 Apply
        </button>
      </div>
    </div>
  

      {showPopup && (
        <div className="apply-popup">
          <h3>Apply for {job?.title}</h3>
          <textarea
            placeholder="Write your message..."
            value={applyMessage}
            onChange={(e) => setApplyMessage(e.target.value)}
          />
          <input
            type="number"
            placeholder="Counter Offer (Optional)"
            value={counterOffer}
            onChange={(e) => setCounterOffer(e.target.value)}
          />
          <button onClick={handleApplySubmit}>Submit</button>
          <button
            style={{ background: "#ff00ff" }}
            onClick={() => setShowPopup(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {showSharePopup && (
        <div
          className="share-popup"
          style={{ background: "var(--glass)", padding: "1rem", borderRadius: "8px" }}
        >
          <h3>Share this Job</h3>
          <button onClick={shareToWhatsApp}>Share to WhatsApp</button>
          <button onClick={shareToX}>Share to X</button>
          <button onClick={copyLink}>Copy Link</button>
          <button
            style={{ background: "#ff00ff" }}
            onClick={() => setShowSharePopup(false)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default JobCard;
