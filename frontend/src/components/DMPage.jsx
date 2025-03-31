import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './DMPage.css';

const DMPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
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
      // Update only if the message belongs to the current conversation
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    try {
      // Optimistically add message using the same field name "message"
      const tempMessage = {
        _id: Date.now().toString(),
        sender: currentUser, // should include _id, username, image etc.
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
      // Replace optimistic message with the saved one
      setMessages(prev => prev.filter(m => !m.isOptimistic).concat(data));

      // Emit via socket to update the other party in real time
      socket?.emit('sendMessage', {
        conversationId: selectedConversation._id,
        sender: currentUser._id,
        receiver: selectedConversation?.participants?.find(p => p._id !== currentUser._id)?._id,
        message: newMessage
      });

      setNewMessage('');
    } catch (err) {
      console.error('Error:', err);
      setMessages(prev => prev.filter(m => !m.isOptimistic));
    }
  };

  // Accept client button logic: remove other conversations with same jobId and navigate
  const handleAcceptClient = () => {
    // Assume jobId is stored in lastMessage of a conversation (if available)
    const jobId = selectedConversation?.lastMessage?.jobId;
    if (jobId) {
      // Filter out any conversation (other than the selected one) that has the same jobId
      const updatedConversations = conversations.filter(conv => {
        if (conv._id === selectedConversation._id) return true;
        return conv.lastMessage?.jobId?.toString() !== jobId.toString();
      });
      setConversations(updatedConversations);
    }
    // Navigate to CreateTimeline component (pass conversation or job data via state if needed)
    navigate('/createtimeline', { state: { conversation: selectedConversation } });
  };

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  if (loading) return <div className="loading">Loading conversations...</div>;

  return (
    <div className="dm-container">
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
      <div className="chat-area">
        {selectedConversation ? (
          <>
            <div className="chat-header">
              <h3>
                {selectedConversation?.participants?.find(p => p._id !== currentUser._id)?.username}
              </h3>
              {selectedConversation?.lastMessage?.jobId && (
                <button className="accept-button" onClick={handleAcceptClient}>
                  Accept Client
                </button>
              )}
            </div>
            <div className="messages-container">
              {messages.map(msg => {
                if (!msg) return null;
                // Use optional chaining for sender
                const senderId = msg.sender ? (typeof msg.sender === 'object' ? msg.sender._id : msg.sender) : '';
                return (
                  <div 
                    key={msg._id}
                    className={`message ${senderId === currentUser._id ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p>{msg.message}</p>
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
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="no-conversation">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DMPage;
