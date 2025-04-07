import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReviewList from "../components/ReviewList";
import "./ProfilePage.css";

const FreelancerPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in.");
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/freelancers/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
        console.log("✅ Profile fetched:", data);

        // Fetch walletAddress
        const walletRes = await fetch("http://localhost:5001/api/wallets/me", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const walletData = await walletRes.json();
        if (walletRes.ok) {
          console.log("✅ Wallet address retrieved:", walletData.walletAddress);
          setWalletAddress(walletData.walletAddress);
        } else {
          console.error("❌ Wallet fetch error:", walletData.error);
        }
      } catch (err) {
        console.error("❌ Error fetching profile or wallet:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProfile();
  }, [id, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="header">
        <img src="images/image50.png" alt="User" />
        <div className="header-right">
          <span onClick={() => navigate("/chat")}>Back to chat</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="main-container">
        <div className="profile-card">
          <div className="card-border-top"></div>
          <div className="img">
            <img src={profile.image || "/default-user.png"} alt="User" />
          </div>
          <span>{profile.username}</span>
          <span className="job">{profile.skills?.join(", ") || "No skills listed"}</span>
          <span>Rating: {profile.rating || "N/A"} ⭐</span>
        </div>

        {/* About Me */}
        <div className="financial-container">
          <h2>About Me</h2>
          <div className="financial-item">
            <span className="label">{profile.bio || "Tell us about yourself..."}</span>
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
            <span className="label">Money in Escrow:</span>
            <span className="value">${profile.moneyInEscrow || 0}</span>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="achievements-section">
        <h2>Achievements</h2>
        <div className="achievements-container">
          {profile.achievements?.length > 0 ? (
            profile.achievements.map((a, i) => (
              <div key={i} className="achievement-box">
                <h3>{a.title}</h3>
                <p>{a.description}</p>
              </div>
            ))
          ) : (
            <p>No achievements listed.</p>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="reviews-section">
        <h2>Reviews Received</h2>
        <div className="reviews-card">
          {walletAddress ? (
            <ReviewList freelancerAddress={walletAddress} />
          ) : (
            <p>No wallet address found. Cannot fetch reviews.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerPage;
