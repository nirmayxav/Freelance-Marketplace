import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './DMPage.css';

const DMPage = () => {

  const navigateToHome = () => {
    navigate('/homes');
  };

  const navigateToChat = () => {
    navigate('/abt');
  };

  const navigateToproj = () => {
    navigate('/ong-proj');
  };

  const navigateToPost = () => {
    navigate('/post');
  };

  const navigateContact = () => {
    navigate('/contact');
  };

  const navigateToAbout = () => {
    navigate('/profile');
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
  const [jobId, setJobId] = useState(null);  // State to store jobId
  const messagesEndRef = useRef(null);
  const [socket, setSocket] = useState(null);

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
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
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

      const receiver = selectedConversation.participants.find(
        p => p._id !== currentUser._id
      );

      // Ensure that the `jobId` is passed
      const jobId = selectedConversation.jobId; // Extract jobId from the full selectedConversation

      // Emit the message with the jobId
      socket?.emit('sendMessage', {
        conversationId: selectedConversation._id,
        sender: currentUser._id,
        receiver: receiver?._id,
        message: newMessage,
        jobId: jobId // Ensure the jobId is included here
      });

      setNewMessage('');
    } catch (err) {
      console.error('Error:', err);
      setMessages(prev => prev.filter(m => !m.isOptimistic));
    }
  };

  const handleAcceptClient = () => {
    localStorage.setItem('selectedConversation', JSON.stringify(selectedConversation));
    console.log('Selected Conversation:', selectedConversation);
    navigate('/create-timeline', { state: { conversation: selectedConversation } });
  };

  // Log the selected conversation and jobId
  const handleConversationClick = (conv) => {
    console.log("Selected Conversation:", conv); // Log selected conversation when clicked
    setSelectedConversation(conv);
    setJobId(conv.jobId); // Store jobId when conversation is selected
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
        onClick={() => {
          console.log("Selected Conversation:", conv); // Log selected conversation when clicked
          setSelectedConversation(conv);
        }}
      >
        <img src={otherUser?.image || '/default-user.png'} alt={otherUser?.username} />
        <div className="conversation-info">
          <h3>{otherUser?.username || 'Unknown User'}</h3>
          <p>{conv.lastMessage?.message?.substring(0, 30) || 'No messages'}</p>
          {/* Correct way to render jobId title */}
          <p>Job Title: {conv.jobId?.title || 'No job associated'}</p> {/* Render job title */}
          {/* Optionally, you can render job description */}
          <p>Job Description: {conv.jobId?.description || 'No description available'}</p> {/* Render job description */}
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
                {selectedConversation?.participants?.find(
                  (p) => p._id !== currentUser._id
                )?.username}
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