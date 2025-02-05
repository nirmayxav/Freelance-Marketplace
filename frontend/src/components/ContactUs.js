import React from 'react';
import './AboutContact.css';
import { useNavigate } from 'react-router-dom';

const ContactUs = () => {
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
        <h1>Get in Touch</h1>
        <p>We'd love to hear from you</p>
      </div>

      <div className="content-section">
        <div className="contact-grid">
          <div className="glass-card contact-form">
            <h2>📩 Send Message</h2>
            <form>
              <div className="form-group">
                <input type="text" placeholder="Name" required />
              </div>
              <div className="form-group">
                <input type="email" placeholder="Email" required />
              </div>
              <div className="form-group">
                <textarea placeholder="Message" rows="5" required></textarea>
              </div>
              <button type="submit" className="gradient-button">
                Send Message
              </button>
            </form>
          </div>

          <div className="glass-card contact-info">
            <h2>📌 Contact Information</h2>
            <div className="info-item">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="var(--primary)" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <p>123 Blockchain Street<br/>Web3 City, Digital Nation</p>
            </div>
            <div className="info-item">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="var(--primary)" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>
              </svg>
              <p>support@freelancechain.com</p>
            </div>
            <div className="info-item">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="var(--primary)" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              <p>+1 (555) 123-4567</p>
            </div>
          </div>
        </div>

        <div className="glass-card faq-section">
          <h2>❓ Frequently Asked Questions</h2>
          <div className="faq-item">
            <h3>How does escrow work?</h3>
            <p>Funds are held in smart contracts until project milestones are approved by both parties.</p>
          </div>
          <div className="faq-item">
            <h3>What blockchain do you use?</h3>
            <p>We use Ethereum with Layer 2 solutions for fast and low-cost transactions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;