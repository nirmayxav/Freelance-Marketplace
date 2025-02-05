import React, { useState } from 'react';
import './ProfilePage.css'; // Make sure to create this CSS file with the styles below
import { useNavigate } from 'react-router-dom';
const ProfilePage = () => {

    const navigate = useNavigate();
  
    const navigateToHome = () => {
      navigate('/homes'); // Navigate to the profile page
    };
  
    const navigateToChat = () => {
      navigate('/chat'); // Navigate to the chat page
    };
    const navigateToproj = () => {
      navigate('/ong-proj'); // Navigate to the chat page
    };
    const navigateToPost = () => {
      navigate('/post'); // Navigate to the chat page
    };
    const navigateContact = () => {
      navigate('/contact'); // Navigate to the chat page
    };
    const navigateToAbout = () => {
      navigate('/abt'); // Navigate to the chat page
    };
  // Dummy data from backend (simulated)
  const [profile, setProfile] = useState({
    name: 'John Doe',
    image: 'path_to_user_image.jpg',
    skills: ['React', 'JavaScript', 'Node.js'],
    bio: 'I am a passionate developer with experience in building web applications.',
    rating: 4.5,
    coins: 100,
    achievements: [
      {
        title: 'Completed 10 Projects',
        description: 'Successfully delivered 10 projects on time.',
      },
      {
        title: 'Top Rated Developer',
        description: 'Achieved a 5-star rating on multiple projects.',
      },
    ],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({ ...profile });

  const handleEdit = () => {
    if (isEditing) {
      // Save changes (simulate backend update)
      setProfile(tempProfile);
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (field, value) => {
    setTempProfile({ ...tempProfile, [field]: value });
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...tempProfile.skills];
    newSkills[index] = value;
    setTempProfile({ ...tempProfile, skills: newSkills });
  };

  const completionPercentage = () => {
    const fields = [tempProfile.name, tempProfile.bio, ...tempProfile.skills];
    const filledFields = fields.filter((field) => field.trim() !== '').length;
    return ((filledFields / fields.length) * 100).toFixed(0);

    
  };

  return (
    <div className="profile-page">
      {/* Header Section */}
      <div className="header">
        <img src='images/image10.png' alt="User" className="" />
        
        <div className="header-right">
          <span onClick={navigateToHome}>Home</span>
          <span onClick={navigateContact}>Contact Us</span>
          <span onClick={navigateToAbout}>About</span>
          <span onClick={navigateToChat}>Chat</span>
          <span onClick={navigateToproj}>Ongoing Projects</span>
          <span onClick={navigateToPost}>Post a Job</span>

          <span >Settings</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="card-border-top"></div>
          <div className="img">
            <img src={profile.image} alt="User" />
          </div>
          <span>{profile.name}</span>
          <span className="job">{profile.skills.join(', ')}</span>
          <span>Rating: {profile.rating} ⭐</span>
          <button onClick={handleEdit}>{isEditing ? 'Save' : 'Edit'}</button>
        </div>

        {/* Achievements Section */}
        <div className="achievements-section">
          <h2>Achievements</h2>
          {profile.achievements.map((achievement, index) => (
            <div  key={index}>
              <div className="content">
                <h3>{achievement.title}</h3>
                <p className="para">{achievement.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="financial-container">
  <h2>Financial Overview</h2>
  <div className="financial-item">
    <span className="label">Platform Coins Earned:</span>
    <span className="value">500 Coins</span>
  </div>
  <div className="financial-item">
    <span className="label">Money Received Till Now:</span>
    <span className="value">$1,200</span>
  </div>
  <div className="financial-item">
    <span className="label">Money in Escrow System:</span>
    <span className="value">$300</span>
  </div>
</div>
      </div>

     {/* Reviews Received Section */}
<div className="reviews-section">
  <h2>Reviews Received</h2>
  <div className="reviews-card">
    <div className="review-item">
      <h3>John Doe</h3>
      <p>"Great work! Delivered on time and exceeded expectations."</p>
      <span>⭐️⭐️⭐️⭐️⭐️</span>
    </div>
    <div className="review-item">
      <h3>Jane Smith</h3>
      <p>"Highly skilled and professional. Will definitely work with again."</p>
      <span>⭐️⭐️⭐️⭐️⭐️</span>
    </div>
    <div className="review-item">
      <h3>Alex Johnson</h3>
      <p>"Excellent communication and quality of work."</p>
      <span>⭐️⭐️⭐️⭐️⭐️</span>
    </div>
  </div>
</div>

      {/* Completion Line */}
      <div className="completion-line">
        <div className="progress-bar" style={{ width: `${completionPercentage()}%` }}></div>
        <span>{completionPercentage()}% Profile Complete</span>
      </div>

      {/* Edit Modal (Conditional Rendering) */}
      {isEditing && (
        <div className="edit-modal">
          <h2>Edit Profile</h2>
          <input
            type="text"
            value={tempProfile.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          <textarea
            value={tempProfile.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
          />
          {tempProfile.skills.map((skill, index) => (
            <input
              key={index}
              type="text"
              value={skill}
              onChange={(e) => handleSkillChange(index, e.target.value)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;