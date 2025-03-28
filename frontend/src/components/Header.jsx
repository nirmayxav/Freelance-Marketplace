import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const Header = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ username: '', email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.id]: e.target.value });
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.id]: e.target.value });
  };

  const handleForgotChange = (e) => {
    setForgotEmail(e.target.value);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        email: loginData.email.trim(),
        password: loginData.password.trim(),
      });
      console.log('Login successful:', response.data);
      localStorage.setItem('token', response.data.token);
      setShowLogin(false);
      navigate('/main');
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5001/api/auth/register', {
        username: signupData.username.trim(),
        email: signupData.email.trim(),
        password: signupData.password.trim(),
      });
      console.log('Signup successful:', response.data);
      setShowSignup(false);
      setShowLogin(true);
    } catch (error) {
      console.error('Signup failed:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Signup failed. Please try again.');
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const response = await axios.post('http://localhost:5001/api/auth/forgot-password', {
        email: forgotEmail.trim(),
      });
      console.log('Forgot password request sent:', response.data);
      setMessage('A reset link has been sent to your email.');
    } catch (error) {
      console.error('Forgot password failed:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Failed to send reset email. Try again.');
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
                <a href="#" onClick={() => { setShowLogin(false); setShowForgotPassword(true); }}>Forgot Password?</a>
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
            <button className="close-button" onClick={() => setShowLogin(false)}>&times;</button>
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
                <label htmlFor="email">Email</label>
                <input type="email" id="email" placeholder="Enter your email" value={signupData.email} onChange={handleSignupChange} required />
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
            <button className="close-button" onClick={() => setShowSignup(false)}>&times;</button>
          </div>
        </div>
      )}

      {showForgotPassword && (
        <div className="popup-overlay">
          <div className="form-container">
            <br></br>
            <h2 className="title">Forgot Password</h2>
            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}
            <form className="form" onSubmit={handleForgotSubmit}>
              <div className="input-group">
                <label htmlFor="forgot-email">Email</label>
                <input type="email" id="forgot-email" placeholder="Enter your email" value={forgotEmail} onChange={handleForgotChange} required />
              </div>
              <br></br>
              <button type="submit" className="sign">Send</button>
            </form>
            <button className="close-button" onClick={() => setShowForgotPassword(false)}>&times;</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
