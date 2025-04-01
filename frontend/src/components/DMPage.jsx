import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './DMPage.css';

const DMPage = () => {

  const navigateToHome = () => {
    navigate('/homes'); // Navigate to the profile page
  };

  const navigateToChat = () => {
    navigate('/abt'); // Navigate to the chat page
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
    navigate('/profile'); // Navigate to the chat page
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const [socket, setSocket] = useState(null);

  // Assume currentUser object includes a role field ("client" or "applicant")
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const token = localStorage.getItem('token');
    const newSocket = io('http://localhost:5001', {
      auth: { token },
      transports: ['websocket']
    });
    setSocket(newSocket);

    newSocket.on('receiveMessage', (message) => {
      if (selectedConversation?._id === message.conversationId) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => newSocket.disconnect();
  }, [selectedConversation]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/conversations', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const { data } = await res.json();
        setConversations(data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!selectedConversation) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `http://localhost:5001/api/conversations/${selectedConversation._id}/messages`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        const { data } = await res.json();
        setMessages(data);
      } catch (err) {
        console.error('Error:', err);
      }
    };
    fetchMessages();
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Log every time selectedConversation changes
  useEffect(() => {
    if (selectedConversation) {
      console.log('Selected Conversation:', selectedConversation);
    }
  }, [selectedConversation]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
  
    try {
      const tempMessage = {
        _id: Date.now().toString(),
        sender: currentUser,
        message: newMessage,
        timestamp: new Date(),
        isOptimistic: true
      };
      setMessages(prev => [...prev, tempMessage]);
  
      const res = await fetch(
        `http://localhost:5001/api/conversations/${selectedConversation._id}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ message: newMessage })
        }
      );
      const { data } = await res.json();
      setMessages(prev => prev.filter(m => !m.isOptimistic).concat(data));
  
      // Get the receiver (the other participant in the conversation)
      const receiver = selectedConversation.participants.find(
        p => p._id !== currentUser._id
      );
  
      // Ensure the jobId is available (adjust this as per your application)
      const jobId = selectedConversation.jobId; // You can access it from the conversation or other context
  
      socket?.emit('sendMessage', {
        conversationId: selectedConversation._id,
        sender: currentUser._id,
        receiver: receiver?._id, // Receiver is the other participant (client or applicant)
        message: newMessage,
        jobId: jobId // Include the jobId here
      });
  
      setNewMessage('');
    } catch (err) {
      console.error('Error:', err);
      setMessages(prev => prev.filter(m => !m.isOptimistic));
    }
  };
  
  const handleAcceptClient = () => {
    // Store the selectedConversation in localStorage
    localStorage.setItem('selectedConversation', JSON.stringify(selectedConversation));
  
    // Log the selectedConversation to the console
    console.log('Selected Conversation:', selectedConversation);
  
    // Navigate to the create-timeline page
    navigate('/create-timeline', { state: { conversation: selectedConversation } });
  };
  
  if (!currentUser) {
    navigate('/login');
    return null;
  }
  if (loading) return <div className="loading">Loading conversations...</div>;

  return (
    <div className="dm-container">
      <div className="header">
        <img src='images/image10.png' alt="User" className="" />
        <div className="header-right">
          <span onClick={navigateToHome}>Home</span>
          <span onClick={navigateToAbout}>Profile</span>
          <span onClick={navigateToproj}>Ongoing Projects</span>
          <span onClick={navigateToPost}>Post a Job</span>
          <span onClick={navigateToChat}>About Us</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="conversation-list">
        <h2>Conversations</h2>
        {conversations.map(conv => {
          const otherUser = conv.participants.find(p => p?._id !== currentUser._id);
          return (
            <div 
              key={conv._id}
              className={`conversation-item ${selectedConversation?._id === conv._id ? 'active' : ''}`}
              onClick={() => setSelectedConversation(conv)}  
            >
              <img src={otherUser?.image || '/default-user.png'} alt={otherUser?.username} />
              <div className="conversation-info">
                <h3>{otherUser?.username || 'Unknown User'}</h3>
                <p>{conv.lastMessage?.message?.substring(0, 30) || 'No messages'}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {selectedConversation ? (
          <>
            <div className="chat-header">
              <h3>
                {
                  selectedConversation?.participants?.find(
                    (p) => p._id !== currentUser._id
                  )?.username
                }
              </h3>
            </div>
            <div className="messages-container">
              {messages.map((msg) => {
                if (!msg) return null;
                const senderId = msg.sender
                  ? typeof msg.sender === 'object'
                    ? msg.sender._id
                    : msg.sender
                  : '';
                const messageClass =
                  senderId === currentUser._id
                    ? currentUser.role === 'client'
                      ? 'client-sent'
                      : 'applicant-sent'
                    : currentUser.role === 'client'
                    ? 'applicant-received'
                    : 'client-received';
                return (
                  <div key={msg._id} className={`message ${messageClass}`}>
                    <div className="message-content">
                      <p>{msg.message}</p>
                      {msg.counterOffer && (
                        <p className="counter-offer">
                          Counter Offer: ${msg.counterOffer}
                        </p>
                      )}
                      <span className="timestamp">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="message-input">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button className="accept-button" onClick={handleAcceptClient}>
                Accept Client
              </button>
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </>
        ) : (
          <p>Select a conversation to start chatting...</p>
        )}
      </div>
    </div>
  );
};

export default DMPage;
