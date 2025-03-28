import React from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import './Features.css';
const MainSection = () => {

const navigate = useNavigate();

  const handlePostJobClick = () => {
    navigate('/post');
  };
  const handlemainClick = () => {
    navigate('/main');
  };

  return (
    <div className="how-it-works">
     <div className="main-hero-section">
  <h1>Meet The Freelance Market</h1>
  <p className="subtitle">Finding Jobs Made Easy</p>
  <h2>Scale your professional workforce with freelancers</h2>
  <div className="search-container">
    <input 
      type="text" 
      placeholder="Search for any service..." 
      className="search-input"
    />
  </div>
  
</div>
     

    <div className="how-it-works">
      <h1 className="title">Here's How It Works</h1>
      <div className="steps">
        <div className="step">
          <img src="/images/image2.png" alt="Step 1" className="step-logo" />
          <p className="description">
         <b>Find Talent </b>– Use advanced search filters to hire the best freelancers based on skills, ratings, and availability.          </p>
        </div>
        <div className="step">
          <img src="/images/image3.png" alt="Step 2" className="step-logo" />
          <p className="description">
         <b>Post & Pay Securely </b>– List projects, set milestones, and pay via Bitcoin, cards, or 50+ currencies with escrow protection.
</p>
        </div>
        <div className="step">
          <img src="/images/image4.png" alt="Step 3" className="step-logo" />
          <p className="description">
          <b>Work & Earn </b>– Bid on jobs, complete milestones, and withdraw earnings via PayPal, crypto, or bank transfer—hassle-free!          </p>
        </div>
      </div>
      <div className="image-with-button">
        <img src="/images/image5.png" alt="How It Works" className="section-image" />
        <button className="action-button">Get Started</button>
      </div>
    </div>


  
    <div className="image-with-button">
      <div className="text-content">
        <h2 className="section-header"><b>Find the Best Talent for Your Projects</b></h2>
        <p className="description">
          Post your projects and find the best freelancers tailored to your needs. Whether it's a quick task or a long-term collaboration, our platform ensures you connect with top talent effortlessly.
        </p>



        <div className="button-container">
        <button className="action-button" onClick={handlemainClick}>
          Start Hiring
        </button></div>

      </div>
      <img src="/images/image23.jpg" alt="Section Image2" className="section-image2" />
    </div>
  
    <div className="post-job-section">
      <img src="/images/image22.jpg" alt="Post Job Image" className="section-image" />
      <div className="text-content">
        <h2 className="section-header"><b>Post Jobs & Hire Top Talent</b></h2>
        <p className="description">
          Easily post your projects and connect with skilled freelancers. Whether it's a quick task or a long-term collaboration, our platform ensures you find the right talent for your needs.
        </p>
        <div className="button-container">
    <button className="action-button" onClick={handlePostJobClick}>Post a Job</button>
  </div>
      </div>
    </div>

    <div className="features-container">
      <h1 className="main-title">ONE PLACE TO CATER ALL YOUR NEEDS</h1>
      <div className="cards-grid">
        <div className="feature-card">
          <h2 className="hii">MARKETING</h2>
          <p>SEO Consulting.</p>
          <p>Email Marketing.</p>
          <p>Social Media Marketing.</p>
          <p>Content Marketing.</p>

        </div>
        <div className="feature-card">
          <h2 className="hii">ENGINEERING</h2>
          <p>CAD Design.</p>
          <p>Mechanical Engineering.</p>
          <p>Electrical Engineering.</p>
          <p>Systems Engineering.</p>

        </div>
        <div className="feature-card">
          <h2 className="hii">WRITING</h2>
          <p>Copywriting.</p>

          <p>Blog Writing.</p>
          <p>Technical Writing .</p>
          <p>Ghostwriting.</p>

        </div>
        <div className="feature-card">
          <h2 className="hii">IT SERVICES</h2>
          <p>UI/UX Design.</p>
          <p>Game Development.</p>
          <p>Web Development.</p>
          <p>App Development.</p>

        </div>
      </div>
      <h1 className="main-title">AND MORE</h1>
    </div>


  

    </div>
  );
};

export default MainSection;