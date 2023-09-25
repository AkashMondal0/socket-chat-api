const express = require('express');
const app = express();
const PORT = 8000;

const http = require('http').Server(app);
const cors = require('cors');

app.use(cors());


const socketIO = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:3000"
  }
});


socketIO.on('connection', (socket) => {
  // console.log(`⚡: ${socket.id} user just connected!`);

  socket.on('join_room', (message) => {
    // console.log(message);
    socket.join(message.conversationId);
    socketIO.to(message.conversationId).emit('message', message);
  });

  socket.on('message', (data) => {
    // console.log(data)
    socket.join(data.conversationId);
    socketIO.to(data.conversationId).emit('message', data);

  });

  socket.on('TypingOn', (message) => {
    socket.join(message.room);
    socketIO.to("1234").emit('message', message);
  });

  socket.on('TypingOff', (message) => {
    socket.join(message.room);
    socketIO.to("1234").emit('message', message);
  });

  socket.on('disconnect', () => {
    // console.log('🔥: A user disconnected');
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Hello world chat backend',
  });
});

http.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});