import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5001"); // Change to your backend URL

const JobCard = ({ job, currentUser }) => {
  // ✅ Always call hooks at the top level
  const [likes, setLikes] = useState(job?.likes || 0);
  const [showPopup, setShowPopup] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [counterOffer, setCounterOffer] = useState("");

  useEffect(() => {
    if (currentUser) {
      socket.emit("register", currentUser._id);
    }

    return () => socket.disconnect();
  }, [currentUser]); // ✅ Runs only when `currentUser` changes

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
    } catch (error) {
      alert(error.message);
    }
  };

  const handleApplySubmit = () => {
    if (!currentUser || !currentUser._id) return alert("You must be logged in to apply.");
    if (!job || !job._id) return alert("Invalid job data.");
    if (!applyMessage.trim()) return alert("Message cannot be empty.");

    const applicationData = {
      senderId: currentUser._id,
      receiverId: job.postedBy, // Job poster
      jobId: job._id,
      message: applyMessage,
      counterOffer: counterOffer || job.budget,
    };

    socket.emit("sendApplication", applicationData);

    alert("Application sent successfully!");
    setShowPopup(false);
    setApplyMessage("");
    setCounterOffer("");
  };

  return (
    <div className="job-card">
      {job?.fileAttachment && <img src={job.fileAttachment} alt={job.title} className="job-image" />}

      <div className="job-content">
        <h3>{job?.title}</h3>
        <p>{job?.description}</p>

        <div className="skills-tags">
          {job?.skillsRequired?.map((skill, index) => (
            <span key={index}>{skill}</span>
          ))}
        </div>

        <div className="job-meta">
          <span>💰 ${job?.budget}</span>
          <span>⏳ {job?.timeline}</span>
          <span>❤️ {likes} Likes</span>
        </div>

        <div className="engagement-buttons">
          <button className="like-btn" onClick={handleLike}>
            {isLiked ? "✅ Liked" : "❤️ Like"}
          </button>
          <button className="bookmark-btn">📌</button>
          <button className="share-btn">📤 Share</button>
        </div>

        <button className="apply-btn" onClick={() => setShowPopup(true)}>Apply Now</button>
      </div>

      {showPopup && (
        <div className="apply-popup">
          <h3>Apply for {job?.title}</h3>
          <textarea placeholder="Write your message..." value={applyMessage} onChange={(e) => setApplyMessage(e.target.value)} />
          <input type="number" placeholder="Counter Offer (Optional)" value={counterOffer} onChange={(e) => setCounterOffer(e.target.value)} />
          <button onClick={handleApplySubmit}>Submit</button>
          <button style={{ background: "#ff00ff" }} onClick={() => setShowPopup(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default JobCard;
