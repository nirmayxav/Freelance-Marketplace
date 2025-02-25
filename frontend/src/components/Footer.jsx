import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  const navigateToAbout = () => {
    navigate('/abt');
  };

  const navigateToContact = () => {
    navigate('/contact');
  };

  return (
    <footer className="reveal">
      <p>© 2025 The Freelance Marketplace</p>
      <br />
      <br />
      <a onClick={navigateToAbout}>About </a>
      <a href="/terms">Terms </a>
      <a onClick={navigateToContact}>Contact </a>
      <a href="/privacy">Privacy </a>
    </footer>
  );
};

export default Footer;