import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from "socket.io-client";  // Import socket.io
import './DMPage.css';

const socket = io("http://localhost:5001"); // Adjust if backend is on another host

const DMPage = ({ currentUser }) => {
  const navigate = useNavigate();/*  */
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [dmList, setDmList] = useState([]); // List of DM users
  const [conversations, setConversations] = useState([]);
  const messagesEndRef = useRef(null);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (currentUser?._id) {
        socket.emit("register", currentUser._id);
    }

    socket.on("receiveMessage", (message) => {
        setMessages((prev) => [...prev, message]);

        // Ensure sender is in DM list
        if (!dmList.some(user => user._id === message.sender)) {
            socket.emit("addToDM", message.sender);
        }
    });

    socket.on("addToDM", (newUser) => {
        if (!dmList.some(user => user._id === newUser._id)) {
            setDmList((prev) => [...prev, newUser]);
        }
    });

    // Listen for new conversation
    socket.on("newConversation", (conversation) => {
        console.log("🆕 New conversation received:", conversation);
        setConversations((prev) => [...prev, conversation]);

        const otherParticipant = conversation.participants.find(u => u !== currentUser._id);
        if (!dmList.some(user => user._id === otherParticipant)) {
            setDmList((prev) => [...prev, { _id: otherParticipant }]);
        }
    });

    return () => {
        socket.off("receiveMessage");
        socket.off("addToDM");
        socket.off("newConversation");
    };
}, [currentUser, dmList]);


  // Send a message
  const handleSend = () => {
    if (newMessage.trim()) {
      const message = {
        sender: currentUser._id,
        receiver: "receiverUserId", // Replace with selected user's ID
        message: newMessage,
      };

      socket.emit("sendMessage", message);
      setNewMessage('');
    }
  };

  return (
    <div className="dm-container">
      {/* Navigation */}
      <div className="header">
        <img src="images/image10.png" alt="User" />
        <div className="header-right">
          <span onClick={() => navigate('/homes')}>Home</span>
          <span onClick={() => navigate('/contact')}>Contact Us</span>
          <span onClick={() => navigate('/abt')}>About</span>
          <span onClick={() => navigate('/ong-proj')}>Ongoing Projects</span>
          <span onClick={() => navigate('/post')}>Post a Job</span>
          <span>Settings</span>
        </div>
      </div>

      {/* Sidebar with DM List */}
      <div className="dm-sidebar">
        <h2>Conversations</h2>
        {dmList.map((user) => (
          <div key={user._id} className="active-chat">
            <div className="user-avatar">{user.name[0]}</div>
            <div className="user-info">
              <h3>{user.name}</h3>
              <p>{user.role}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="chat-window">
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender === currentUser._id ? 'sent' : 'received'}`}>
              <div className="message-content">
                <div className="message-header">
                  <span className="sender">{msg.sender === currentUser._id ? "You" : "Client"}</span>
                  <span className="timestamp">{new Date().toLocaleTimeString()}</span>
                </div>
                <p>{msg.message}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
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
