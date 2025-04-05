import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css'; // optional: if you want styling

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="footer reveal">
      <p>© 2025 The Freelance Marketplace</p>
      <div className="footer-links">
        <span onClick={() => navigate('/abt')}>About</span>
        <span onClick={() => navigate('/terms')}>Terms</span>
        <span onClick={() => navigate('/contact')}>Contact</span>
        <span onClick={() => navigate('/privacy')}>Privacy</span>
      </div>
    </footer>
  );
};

export default Footer;
