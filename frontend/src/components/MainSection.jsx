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
    <div className="how-it-works">
      <h1 className="title">Here's How It Works</h1>
      <div className="steps">
        <div className="step">
          <img src="/images/image2.png" alt="Step 1" className="step-logo" />
          <p className="description">
            Discover top talent tailored to your needs using our advanced search tools. Filter freelancers by skills, ratings, location, pricing, and availability to narrow down candidates who align with your project goals. 
          </p>
        </div>
        <div className="step">
          <img src="/images/image3.png" alt="Step 2" className="step-logo" />
          <p className="description">
            List your projects and choose from Bitcoin, credit/debit cards, or 50+ currencies for seamless payments. Set milestones with automated escrow, ensuring security for both parties. Hire globally, pay instantly—no borders, no delays.
          </p>
        </div>
        <div className="step">
          <img src="/images/image4.png" alt="Step 3" className="step-logo" />
          <p className="description">
            Browse thousands of jobs matching your skills and bid with competitive rates. Work confidently with protected milestones and withdraw earnings via PayPal, crypto, or direct bank transfer. Focus on delivering excellence—we handle payment reliability.
          </p>
        </div>
      </div>
      <div className="image-with-button">
        <img src="/images/image5.png" alt="How It Works" className="section-image" />
        <button className="action-button">Get Started</button>
      </div>
    </div>


  
    <div className="image-with-button">
      <div className="text-content">
        <h2 className="section-header">Find the Best Talent for Your Projects</h2>
        <p className="description">
          Post your projects and find the best freelancers tailored to your needs. Whether it's a quick task or a long-term collaboration, our platform ensures you connect with top talent effortlessly.
        </p>
        <button className="action-button" onClick={handlemainClick}>
          Start Hiring
        </button>
      </div>
      <img src="/images/image6.png" alt="Section Image2" className="section-image2" />
    </div>
  
    <div className="post-job-section">
      <img src="/images/image7.png" alt="Post Job Image" className="section-image" />
      <div className="text-content">
        <h2 className="section-header">Post Jobs & Hire Top Talent</h2>
        <p className="description">
          Easily post your projects and connect with skilled freelancers. Whether it's a quick task or a long-term collaboration, our platform ensures you find the right talent for your needs.
        </p>
        <button className="action-button" onClick={handlePostJobClick}>Post a Job</button>
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


    <footer className="reveal">
      <p>© 2025 The Freelance Marketplace</p>
      <br></br>
      <br></br>
      <a href="/about">About </a>
      <a href="/terms">Terms </a>
      <a href="/contact">Contact </a>
      <a href="/privacy">Privacy </a>
    </footer>


    </div>
  );
};

export default MainSection;