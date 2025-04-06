import React, { useState, useEffect } from "react";
import './JobCard.css'; // optional: if you want styling
import ApplyPopup from "./ApplyPopup"; // Ensure the ApplyPopup component is imported correctly
// Ensure the socket instance is imported from a common module
import { socket } from "./socket"; // e.g., from
import SharePopup from "./SharePopup";
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
    
  
    <div className="freelance-card-body">
      <h3 className="freelance-card-title">{job?.title}</h3>
      <p className="freelance-card-desc">
  {(() => {
    const words = job?.description?.split(" ") || [];
    const shortText = words.slice(0, 50).join(" ");
    const hasMore = words.length > 50;

    return (
      <>
        {shortText}
        {hasMore && <span style={{ color: "var(--primary)" }}>...</span>}
      </>
    );
  })()}
</p>  
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
  <ApplyPopup
    job={job}
    applyMessage={applyMessage}
    setApplyMessage={setApplyMessage}
    counterOffer={counterOffer}
    setCounterOffer={setCounterOffer}
    onSubmit={handleApplySubmit}
    onClose={() => setShowPopup(false)}
  />
)}


{showSharePopup && (
  <SharePopup
    onClose={() => setShowSharePopup(false)}
    shareToWhatsApp={shareToWhatsApp}
    shareToX={shareToX}
    copyLink={copyLink}
  />
)}

    </div>
  );
};

export default JobCard;
