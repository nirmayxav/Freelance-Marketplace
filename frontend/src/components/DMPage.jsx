import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

import './DMPage.css';

const DMPage = () => {
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
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hi! Are you available for the project?', sender: 'client', timestamp: '10:30 AM' },
    { id: 2, text: 'Yes, I am. Can you share details?', sender: 'freelancer', timestamp: '10:31 AM' },
    { id: 3, text: 'I need a responsive website built with React', sender: 'client', timestamp: '10:32 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        text: newMessage,
        sender: 'client', // Change based on auth
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handlePostJobClick = () => {
    navigate('/create-timeline'); // Navigate to the create-timeline page
  };

  return (
    <div className="dm-container">
       <div className="header">
        <img src='images/image10.png' alt="User" className="" />
        
        <div className="header-right">
          <span onClick={navigateToHome}>Home</span>
          <span onClick={navigateContact}>Contact Us</span>
          <span onClick={navigateToAbout}>About</span>
          
          <span onClick={navigateToproj}>Ongoing Projects</span>
          <span onClick={navigateToPost}>Post a Job</span>

          <span >Settings</span>
        </div>
      </div>

      <div className="dm-sidebar">
        <h2>Conversations</h2>
        <div className="active-chat">
          <div className="user-avatar">JD</div>
          <div className="user-info">
            <h3>John Doe</h3>
            <p>Client</p>
          </div>
        </div>
        <div className="other-user">
          <div className="user-avatar">SP</div>
          <div className="user-info">
            <h3>Sarah Parker</h3>
            <p>Freelancer</p>
          </div>
        </div>

        {/* Accept Client Button */}
        <div className="accept-client">
          <button 
            onClick={handlePostJobClick} // Use the handlePostJobClick function
            className="accept-button"
          >
            ✅ Accept Client
          </button>
        </div>
      </div>

      <div className="chat-window">
        <div className="messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === 'client' ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <div className="message-header">
                  <span className="sender">{message.sender}</span>
                  <span className="timestamp">{message.timestamp}</span>
                </div>
                <p>{message.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="message-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DMPage;