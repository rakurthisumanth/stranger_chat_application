// src/SocketClient.js
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // outside the component to prevent reconnecting every render

const SocketClient = () => {
    console.log(socket.id,"user idddddddddd")
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  useEffect(() => {
    socket.on('received', (data) => {
      setChat((prev) => [...prev, data.message]);
    });
    return () => {
      socket.off('received');
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('send_message', { message });
      setMessage('');
    }
  };

  return (
    <div>
      <h2>Socket.IO Client</h2>
      
      <div style={{ height: 200, border: '1px solid gray', padding: 10, overflowY: 'scroll', marginBottom: 10 }}>
        {chat.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>

      <input
        type="text"
        value={message}
        placeholder="Type message..."
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default SocketClient;
