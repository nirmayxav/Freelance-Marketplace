import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css'; // Ensure you have this CSS file for styling

const MainPage = () => {
  const navigate = useNavigate();

  const navigateToProfile = () => {
    navigate('/profile'); // Navigate to the profile page
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
    <div className="profile-page">
    {/* Header Section */}
    <div className="header">
      <img src='images/image10.png' alt="User" className="" />
      
      
      <div className="header-right">
        <span onClick={navigateToProfile}>Profile</span>
        <span onClick={navigateToChat}>Chat</span>
        <span onClick={navigateToproj}>Ongoing Projects</span>
        <span onClick={navigateToPost}>Post a Job</span>
        <span onClick={navigateContact}>Contact Us</span>
        <span onClick={navigateToAbout}>About</span>
        <span>Settings</span>
      </div>
    </div>

    

    <div className="job-platform">
  {/* Hero Section */}
  <div className="hero-filter-container">
  {/* Hero Section */}
  <div className="hero-section">
    <h1>Discover Your Next Opportunity</h1>
    <p className="hero-subtitle">Join the future of work with cutting-edge projects and global opportunities.</p>
    <div className="search-container">
      <input type="text" placeholder="Search jobs (e.g., 'AI Engineer')" className="search-bar" />
      <button className="search-button">🔍 Search</button>
    </div>
    <div className="featured-job">
      <h2>🌟 Featured Job</h2>
      <div className="featured-job-card">
        <h3>AI/ML Engineer</h3>
        <p>Build intelligent systems and machine learning models for real-world applications.</p>
        <div className="skills-tags">
          <span>Python</span>
          <span>TensorFlow</span>
          <span>Neural Networks</span>
        </div>
        <div className="job-meta">
          <span>💰 $12,000</span>
          <span>⏳ 45 Days</span>
        </div>
      </div>
    </div>
  </div>

  {/* Filter Section */}
  <div className="filter-section">
    <h2>Refine Your Search</h2>
    <div className="filter-group">
      <label>Category</label>
      <select className="filter-dropdown">
        <option>All Categories</option>
        <option>AI/ML</option>
        <option>Web Development</option>
        <option>Blockchain</option>
      </select>
    </div>
    <div className="filter-group">
      <label>Budget Range</label>
      <input type="range" min="0" max="10000" className="budget-slider" />
      <span>$0 - $10,000</span>
    </div>
    <div className="filter-group">
      <label>Skills</label>
      <input type="text" placeholder="Enter skills (e.g., React, Python)" className="skills-input" />
    </div>
    <button className="apply-filters">Apply Filters</button>
  </div>
</div>
  {/* Trending Jobs Section */}
  <div className="trending-jobs">
  <h2>🔥 Trending Jobs</h2>
  <div className="trending-grid">
    {/* Job 1 */}
    <div className="trending-card">
      <div className="trending-badge">Most Applied</div>
      <h3>AI Solutions Architect</h3>
      <p className="applications">🎯 245 Applications</p>
      <p>Design and implement enterprise-scale AI solutions</p>
      <div className="skills-tags">
        <span>Python</span>
        <span>TensorFlow</span>
        <span>Cloud AI</span>
      </div>
      <div className="trending-meta">
        <span>💰 $15,000</span>
        <span>⏳ 60 Days</span>
      </div>
      <button className="apply-btn">Apply Now</button>
    </div>

    {/* Job 2 */}
    <div className="trending-card">
      <h3>Blockchain Developer</h3>
      <p className="applications">🎯 198 Applications</p>
      <p>Build decentralized applications on Ethereum</p>
      <div className="skills-tags">
        <span>Solidity</span>
        <span>Web3</span>
        <span>Smart Contracts</span>
      </div>
      <div className="trending-meta">
        <span>💰 $12,000</span>
        <span>⏳ 45 Days</span>
      </div>
      <button className="apply-btn">Apply Now</button>
    </div>

    {/* Job 3 */}
    <div className="trending-card">
      <h3>Quantum Computing Engineer</h3>
      <p className="applications">🎯 176 Applications</p>
      <p>Develop algorithms for quantum processors</p>
      <div className="skills-tags">
        <span>Q#</span>
        <span>Quantum ML</span>
        <span>Python</span>
      </div>
      <div className="trending-meta">
        <span>💰 $20,000</span>
        <span>⏳ 90 Days</span>
      </div>
      <button className="apply-btn">Apply Now</button>
    </div>
  </div>
</div>
  {/* Job Grid */}
  <div className="job-grid">
    {/* Repeat this card for multiple jobs */}
    <div className="job-card">
      <div className="engagement-buttons">
        <button className="like-btn">❤️ 24</button>
        <button className="bookmark-btn">📌</button>
        <button className="share-btn">📤</button>
      </div>
      <h3>Frontend Developer Needed</h3>
      <p>Create responsive user interfaces for SaaS platform</p>
      <div className="skills-tags">
        <span>JavaScript</span>
        <span>CSS</span>
        <span>API Integration</span>
      </div>
      <div className="job-meta">
        <span>💰 $2,500</span>
        <span>⏳ 14 Days</span>
      </div>
      <button className="apply-btn">Apply Now</button>
    </div>
  </div>

</div>
</div>  
  );
};

export default MainPage;