import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://strangerchatbackend-production.up.railway.app/');

function App() {
  const [username, setUsername] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on('users_online', (users) => {
      setOnlineUsers(users.filter(u => u !== username)); // Don't show self
    });

    socket.on('private_message', ({ from, message }) => {
      setChat(prev => [...prev, { from, message }]);
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
      socket.emit('send_private_message', { to: selectedUser, from: username, message });
      setChat(prev => [...prev, { from: username, message }]);
      setMessage('');
    }
  };

  if (!loggedIn) {
    return (
      <div style={{ padding: 20 }}>
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
    <div style={{ padding: 20 }}>
      <h2>Hello, {username}</h2>

      <div style={{ display: 'flex', gap: 20 }}>
        <div>
          <h3>Online Users</h3>
          {onlineUsers.map(user => (
            <div
              key={user}
              onClick={() => setSelectedUser(user)}
              style={{
                cursor: 'pointer',
                fontWeight: selectedUser === user ? 'bold' : 'normal',
                color: selectedUser === user ? 'blue' : 'black',
                marginBottom: 5
              }}
            >
              {user}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }}>
          <h3>Chat with {selectedUser || '...'}</h3>
          <div style={{ border: '1px solid #ccc', height: 200, padding: 10, overflowY: 'scroll' }}>
            {chat.map((msg, i) => (
              <div key={i} style={{ textAlign: msg.from === username ? 'right' : 'left' }}>
                <strong>{msg.from}:</strong> {msg.message}
              </div>
            ))}
          </div>

          <input
            placeholder="Type a message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} disabled={!selectedUser}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
