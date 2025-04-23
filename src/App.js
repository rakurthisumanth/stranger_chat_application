// src/App.js
import React from 'react';
import SocketClient from './socket';

function App() {
  return (
    <div>
      <h1>Socket.IO Chat App</h1>
      <SocketClient />
    </div>
  );
}

export default App;
