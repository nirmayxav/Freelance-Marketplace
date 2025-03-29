import React, { useState, useEffect } from "react";
import "./ProfilePage.css"; // Updated CSS for styling
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to upload file using the Multer endpoint
  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("profilePhoto", file);
    formData.append("userId", profile._id); // Assumes profile._id exists

    try {
      const response = await fetch("http://localhost:5001/api/user/uploadProfile", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        // Update tempProfile with the returned URL from multer
        handleChange("profilePhoto", data.profilePhoto);
      } else {
        console.error("Upload error: ", data.error);
      }
    } catch (error) {
      console.error("Error uploading file: ", error);
    }
  };

  // Fetch profile data from the server
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
      .then((res) => (res.ok ? res.json() : Promise.reject("Failed to fetch profile")))
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

  // Handle profile edit/save
  const handleEdit = () => {
    if (isEditing) {
      // Optimistically update the UI immediately
      setProfile(tempProfile);

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Authentication token missing.");
        return;
      }

      fetch("http://localhost:5001/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tempProfile),
      })
        .then((res) => (res.ok ? res.json() : Promise.reject("Failed to update profile")))
        .then((updatedProfile) => {
          setProfile(updatedProfile);
          setIsEditing(false); // Close modal after successful save
        })
        .catch((err) => {
          console.error("Error updating profile:", err);
        });
    } else {
      setIsEditing(true);
    }
  };

  // Handle input changes during editing
  const handleChange = (field, value) => {
    setTempProfile({ ...tempProfile, [field]: value });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="header">
        <img src="images/image10.png" alt="User" />
        <div className="header-right">
          <span onClick={() => navigate("/homes")}>Home</span>
          <span onClick={() => navigate("/contact")}>Contact Us</span>
          <span onClick={() => navigate("/abt")}>About</span>
          <span onClick={() => navigate("/chat")}>Chat</span>
          <span onClick={() => navigate("/ong-proj")}>Ongoing Projects</span>
          <span onClick={() => navigate("/post")}>Post a Job</span>
          <span>Settings</span>
        </div>
      </div>

      {/* Main Container: Profile, About Me & Financial Overview in one row */}
      <div className="main-container">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="card-border-top"></div>
          <div className="img">
            <img src={profile.profilePhoto || "default-user.png"} alt="User" />
          </div>
          <span>{profile.name || "User"}</span>
          <span className="job">
            {profile.skills ? profile.skills.join(", ") : "No skills listed"}
          </span>
          <span>Rating: {profile.rating || "N/A"} ⭐</span>
          <button onClick={handleEdit}>{isEditing ? "Save" : "Edit"}</button>
        </div>

        {/* About Me Section */}
        <div className="about-me">
          <h2>About Me</h2>
          <p>{profile.bio || "Tell us about yourself..."}</p>
          <h3>Skills:</h3>
          <p>{profile.skills ? profile.skills.join(", ") : "No skills listed."}</p>
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
          <h2>Edit Profile</h2>
          <div
            className="drag-drop-area"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) {
                handleFileUpload(file);
              }
            }}
          >
            <p>Drag &amp; drop your photo here or click to select</p>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleFileUpload(file);
                }
              }}
            />
          </div>
          <input
            type="password"
            value={tempProfile.password || ""}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="Password"
          />
          <textarea
            value={tempProfile.bio || ""}
            onChange={(e) => handleChange("bio", e.target.value)}
            placeholder="Tell about yourself (max 100 words)"
            maxLength="100"
          />
          <input
            type="text"
            value={tempProfile.skills ? tempProfile.skills.join(", ") : ""}
            onChange={(e) =>
              handleChange(
                "skills",
                e.target.value.split(",").map((s) => s.trim())
              )
            }
            placeholder="Enter skills separated by commas"
          />
          <button onClick={handleEdit} className="save-btn">
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
