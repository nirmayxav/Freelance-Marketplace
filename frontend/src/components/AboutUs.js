import React from 'react';
import './AboutContact.css';
import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
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
  return (
    <div className="about-contact-container">
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

      <div className="gradient-header">
        <h1>About Our Platform</h1>
        <p>Connecting Talent with Opportunity</p>
      </div>

      <div className="content-section">
        <div className="glass-card">
          <h2>🌟 Our Mission</h2>
          <p>
            We're revolutionizing the freelance industry by creating a secure, transparent, 
            and efficient ecosystem where clients and freelancers can collaborate 
            with confidence through blockchain-powered escrow and smart contracts.
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>10,000+</h3>
            <p>Successful Projects</p>
          </div>
          <div className="stat-card">
            <h3>95%</h3>
            <p>Client Satisfaction</p>
          </div>
          <div className="stat-card">
            <h3>$5M+</h3>
            <p>Transactions Secured</p>
          </div>
        </div>

        <div className="glass-card team-section">
          <h2>🚀 The Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="avatar">JD</div>
              <h3>John Doe</h3>
              <p>CEO & Founder</p>
            </div>
            <div className="team-member">
              <div className="avatar">SP</div>
              <h3>Sarah Parker</h3>
              <p>CTO</p>
            </div>
            <div className="team-member">
              <div className="avatar">MT</div>
              <h3>Mike Taylor</h3>
              <p>Blockchain Lead</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;