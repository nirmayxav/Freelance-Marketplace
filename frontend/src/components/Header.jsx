import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ username: '', name: '', email: '', role: 'freelancer', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.id]: e.target.value });
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.id]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', {  // Updated URL
        email: loginData.email.trim(),
        password: loginData.password.trim(),
      });
      console.log('Login successful:', response.data);
      localStorage.setItem('token', response.data.token);  // Store token
      setShowLogin(false);
      navigate('/mainpage');  // Navigate to the main page
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5001/api/auth/register', {  // Updated URL
        username: signupData.username.trim(),
        name: signupData.name.trim(),
        email: signupData.email.trim(),
        role: signupData.role.trim(),
        password: signupData.password.trim(),
      });
      console.log('Signup successful:', response.data);
      setShowSignup(false);
      setShowLogin(true);  // Show login form after successful signup
    } catch (error) {
      console.error('Signup failed:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="header">
      <img src="/images/image1.png" alt="Logo" className="logo" />
      <div className="auth-buttons">
        <button className="custom-button" onClick={() => setShowLogin(true)}>
          <span className='custom-span'>Login</span>
        </button>
        <button className="custom-button" onClick={() => setShowSignup(true)}>
          <span>Sign Up</span>
        </button>
      </div>

      {showLogin && (
        <div className="popup-overlay">
          <div className="form-container">
            <h2 className="title">Login</h2>
            {error && <p className="error-message">{error}</p>}
            <form className="form" onSubmit={handleLoginSubmit}>
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" placeholder="Enter your email" value={loginData.email} onChange={handleLoginChange} required />
              </div>
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" placeholder="Enter your password" value={loginData.password} onChange={handleLoginChange} required />
              </div>
              <div className="forgot">
                <a href="/forgot-password">Forgot Password?</a>
              </div>
              <button type="submit" className="sign">Sign In</button>
            </form>
            <div className="signup">
              <p>
                Don't have an account?{' '}
                <a href="#" onClick={() => { setShowLogin(false); setShowSignup(true); }}>
                  Sign Up
                </a>
              </p>
            </div>
            <button className="close-button" onClick={() => setShowLogin(false)}>
              &times;
            </button>
          </div>
        </div>
      )}

      {showSignup && (
        <div className="popup-overlay">
          <div className="form-container">
            <h2 className="title">Sign Up</h2>
            {error && <p className="error-message">{error}</p>}
            <form className="form" onSubmit={handleSignupSubmit}>
              <div className="input-group">
                <label htmlFor="username">Username</label>
                <input type="text" id="username" placeholder="Enter your username" value={signupData.username} onChange={handleSignupChange} required />
              </div>
              <div className="input-group">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" placeholder="Enter your name" value={signupData.name} onChange={handleSignupChange} required />
              </div>
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" placeholder="Enter your email" value={signupData.email} onChange={handleSignupChange} required />
              </div>
              <div className="input-group">
                <label htmlFor="role">Role</label>
                <select id="role" value={signupData.role} onChange={handleSignupChange} required>
                  <option value="freelancer">Freelancer</option>
                  <option value="client">Client</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" placeholder="Enter your password" value={signupData.password} onChange={handleSignupChange} required />
              </div>
              <button type="submit" className="sign signup-button">Sign Up</button>
            </form>
            <div className="signup">
              <p>
                Already have an account?{' '}
                <a href="#" onClick={() => { setShowSignup(false); setShowLogin(true); }}>
                  Login
                </a>
              </p>
            </div>
            <button className="close-button" onClick={() => setShowSignup(false)}>
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
