import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io('https://strangerchatbackend-production.up.railway.app/');

function App() {
  const [username, setUsername] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [message, setMessage] = useState('');
  const [allMessages, setAllMessages] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    socket.on('users_online', (users) => {
      setOnlineUsers(users.filter(u => u !== username));
    });

    socket.on('private_message', ({ from, to, message }) => {
      setAllMessages(prev => [...prev, { from, to, message }]);
    });

    return () => {
      socket.off('users_online');
      socket.off('private_message');
    };
  }, [username]);

  const handleLogin = () => {
    if (username.trim()) {
      socket.emit('login', username);
      setLoggedIn(true);
    }
  };

  const sendMessage = () => {
    if (selectedUser && message.trim()) {
      socket.emit('send_private_message', {
        to: selectedUser,
        from: username,
        message
      });
      setAllMessages(prev => [...prev, { from: username, to: selectedUser, message }]);
      setMessage('');
    }
  };

  const filteredChat = allMessages.filter(
    msg =>
      (msg.from === username && msg.to === selectedUser) ||
      (msg.from === selectedUser && msg.to === username)
  );

  if (!loggedIn) {
    return (
      <div className="login-container">
        <h2>Login</h2>
        <input
          placeholder="Enter username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Online Users Sidebar */}
      {(!isMobile || (isMobile && !selectedUser)) && (
        <aside className="sidebar">
          <div>
            <h2>Welcome, {username}</h2>
            <button onClick={() => {
              socket.disconnect();
              setLoggedIn(false);
              setSelectedUser('');
            }}>Logout</button>
          </div>
          <h3>Online Users</h3>
          {onlineUsers.map(user => (
            <div
              key={user}
              onClick={() => setSelectedUser(user)}
              className={`user-item ${selectedUser === user ? 'active' : ''}`}
            >
              {user}
            </div>
          ))}
        </aside>
      )}

      {/* Chat Area */}
      {(!isMobile || (isMobile && selectedUser)) && (
        <main className="chat-container">
          {isMobile && (
            <button
              onClick={() => setSelectedUser('')}
              className="back-button"
              style={{ marginBottom: '10px' }}
            >
              ← Back to Users
            </button>
          )}
          <h3>Chat with {selectedUser || '...'}</h3>
          <div className="chat-messages">
            {filteredChat.map((msg, i) => (
              <div
                key={i}
                className={`message ${msg.from === username ? 'sent' : 'received'}`}
              >
                <strong>{msg.from}:</strong> {msg.message}
              </div>
            ))}
          </div>

          <div className="input-area">
            <input
              placeholder="Type a message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              disabled={!selectedUser}
            />
            <button onClick={sendMessage} disabled={!selectedUser}>Send</button>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
