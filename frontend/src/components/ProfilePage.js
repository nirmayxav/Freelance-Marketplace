import React, { useState, useEffect } from "react";
import "./ProfilePage.css";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch profile data from the server on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in.");
      navigate("/login");
      return;
    }

    fetch("http://localhost:5001/api/user/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) =>
        res.ok ? res.json() : Promise.reject("Failed to fetch profile")
      )
      .then((data) => {
        setProfile(data);
        setTempProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
        setLoading(false);
      });
  }, [navigate]);

  // Generic change handler for form inputs
  const handleChange = (field, value) => {
    setTempProfile({ ...tempProfile, [field]: value });
  };

  // Function to handle file upload for profile photo using your drag-drop/upload box style
  const handleFileUpload = async (file) => {
    if (!profile) return;
    const formData = new FormData();
    formData.append("profilePhoto", file);
    formData.append("userId", profile._id);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5001/api/user/uploadProfile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      // Check if the response content type is JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (response.ok) {
          // Update image in both tempProfile and profile states
          handleChange("image", data.image);
          setProfile(prev => ({ ...prev, image: data.image }));
        } else {
          console.error("Upload error:", data.message || "Unknown error");
        }
      } else {
        // If not JSON, log the text response for debugging
        const text = await response.text();
        console.error("Server did not return JSON:", text);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  
  // Save changes made in the edit modal
  const saveProfileChanges = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    // Prepare payload – note that password update now requires both oldPassword and newPassword if you want to change it.
    const payload = {
      email: tempProfile.email,
      bio: tempProfile.bio,
      skills: tempProfile.skills,
      profilePhoto: tempProfile.image, // API expects "profilePhoto"
    };

    // Include password update if both old and new passwords are provided
    if (tempProfile.oldPassword && tempProfile.newPassword) {
      payload.oldPassword = tempProfile.oldPassword;
      payload.newPassword = tempProfile.newPassword;
    }

    fetch("http://localhost:5001/api/user/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) =>
        res.ok ? res.json() : Promise.reject("Failed to update profile")
      )
      .then((updatedProfile) => {
        setProfile(updatedProfile);
        setTempProfile(updatedProfile);
        setIsEditing(false);
        setSuccessMsg("Profile updated successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      })
      .catch((err) => {
        console.error("Error updating profile:", err);
        setError("Failed to update profile");
      });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    navigate("/");
  };
  return (
    <div className="profile-page">
      {/* Header */}
      <div className="header">
        <img src="images/image10.png" alt="User" />
        <div className="header-right">
          <span onClick={() => navigate("/homes")}>Home</span>
          <span onClick={() => navigate("/post")}>Post a Job</span>
          
          <span onClick={() => navigate("/chat")}>Chat</span>
          <span onClick={() => navigate("/ong-proj")}>Ongoing Projects</span>
          <span onClick={() => navigate("/abt")}>About Us</span>
          <span onClick={() => navigate("/contact")}>Contact Us</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
         
        </div>
      </div>

      {/* Main Container */}
      <div className="main-container">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="card-border-top"></div>
          <div className="img">
            <img src={profile.image || "default-user.png"} alt="User" />
          </div>
          <span>{profile.username || "User"}</span>
          <span className="job">
            {profile.skills ? profile.skills.join(", ") : "No skills listed"}
          </span>
          <span>Rating: {profile.rating || "N/A"} ⭐</span>
          <button onClick={() => setIsEditing(true)}>Edit</button>
          {successMsg && <p className="success-msg">{successMsg}</p>}
        </div>

        {/* About Me Section */}
        <div className="financial-container">
          <h2>About Me</h2>
          <div className="financial-item">
          <span className="label">{profile.bio || "Tell us about yourself..."}</span>
          </div>
          <div className="financial-item">

         
          <span className="label">
            Skills: 
            {profile.skills ? profile.skills.join(", ") : "No skills listed."}
          </span>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="financial-container">
          <h2>Financial Overview</h2>
          <div className="financial-item">
            <span className="label">Platform Coins Earned:</span>
            <span className="value">{profile.coins || 0} Coins</span>
          </div>
          <div className="financial-item">
            <span className="label">Money Received Till Now:</span>
            <span className="value">${profile.moneyReceived || 0}</span>
          </div>
          <div className="financial-item">
            <span className="label">Money in Escrow System:</span>
            <span className="value">${profile.moneyInEscrow || 0}</span>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="achievements-section">
        <h2>Achievements</h2>
        <div className="achievements-container">
          {profile.achievements && profile.achievements.length > 0 ? (
            profile.achievements.map((achievement, index) => (
              <div key={index} className="achievement-box">
                <h3>{achievement.title}</h3>
                <p>{achievement.description}</p>
              </div>
            ))
          ) : (
            <p>No achievements listed.</p>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2>Reviews Received</h2>
        <div className="reviews-card">
          {profile.reviews && profile.reviews.length > 0 ? (
            profile.reviews.map((review, index) => (
              <div key={index} className="review-item">
                <h3>{review.reviewer || "Anonymous"}</h3>
                <p>"{review.comment || "No comment"}"</p>
                <span>{"⭐".repeat(review.rating || 0)}</span>
              </div>
            ))
          ) : (
            <p>No reviews available.</p>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="edit-modal">
          <div className="modal-content">
            <h2>Edit Profile</h2>
            {/* Profile Photo Upload Area */}
            <div
              className="file-upload"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  handleFileUpload(file);
                }
              }}
            >
              <label className="upload-area">
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                />
                <div className="upload-content">
                  <svg viewBox="0 0 24 24" width="48" height="48">
                    <path
                      fill="currentColor"
                      d="M14,13V17H10V13H7L12,8L17,13H14M19.35,10.03C18.67,6.59 15.64,4 12,4C9.11,4 6.6,5.64 5.35,8.03C2.34,8.36 0,10.9 0,14A6,6 0 0,0 6,20H19A5,5 0 0,0 24,15C24,12.36 21.95,10.22 19.35,10.03Z"
                    />
                  </svg>
                  <p>Drag files here or click to upload</p>
                </div>
              </label>
            </div>
            {/* Password Update Fields */}
            <label>Old Password</label>
            <input
              type="password"
              value={tempProfile.oldPassword || ""}
              onChange={(e) => handleChange("oldPassword", e.target.value)}
              placeholder="Enter old password"
            />
            <label>New Password</label>
            <input
              type="password"
              value={tempProfile.newPassword || ""}
              onChange={(e) => handleChange("newPassword", e.target.value)}
              placeholder="New Password (leave blank to keep unchanged)"
            />
            {/* Other Editable Fields */}
            <label>Bio</label>
            <textarea
              value={tempProfile.bio || ""}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="Tell us about yourself (max 100 words)"
              maxLength="100"
            />
            <label>Skills (comma separated)</label>
            <input
              type="text"
              value={
                tempProfile.skills ? tempProfile.skills.join(", ") : ""
              }
              onChange={(e) =>
                handleChange(
                  "skills",
                  e.target.value.split(",").map((s) => s.trim())
                )
              }
              placeholder="Enter skills separated by commas"
            />
            {/* Modal Action Buttons */}
            <div className="modal-buttons">
              <button onClick={saveProfileChanges} className="save-btn">
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
