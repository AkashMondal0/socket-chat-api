const express = require('express');
const app = express();
const PORT = process.env.PORT || 3003;
var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const firebase_Notification = admin.messaging();

const http = require('http').Server(app);
const cors = require('cors');
app.use(express.json());

app.use(cors());


const socketIO = require('socket.io')(http, {
  cors: {
    origin: "*"
  }
});


socketIO.on('connection', (socket) => {

  // user --------------------------------------
  socket.on('user_connect', (user) => {
    socket.join(user.id);
    console.log('user connect', user.id);
  });

  // user chat list -------------------------------
  socket.on('user_chat_list', (_data) => {
    const { receiverId, senderId, data } = _data;

    socket.join(receiverId);
    socket.join(senderId);
    socketIO.to(senderId).emit('user_chat_list', data);
    socketIO.to(receiverId).emit('user_chat_list', data);
  });

  // message --------------------------------------
  socket.on('message_for_user', (_data) => {
    const { receiverId, senderId, data } = _data;

    socket.join(receiverId);
    socket.join(senderId);
    socketIO.to(senderId).emit('message_for_user', data);
    socketIO.to(receiverId).emit('message_for_user', data);
  });

  socket.on('message_for_user_seen', (_data) => {
    const { receiverId, senderId, data } = _data;
    socket.join(receiverId);
    socketIO.to(receiverId).emit('message_for_user_seen', _data);
  });

  // typing --------------------------------------
  socket.on('_typing', (_data) => {
    const { receiverId, senderId, conversationId, typing } = _data;
    socket.join(receiverId);
    socketIO.to(receiverId).emit('_typing', _data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

});
app.get('/', (req, res) => {
  res.send('socket server is running, with firebase cloud message service');
});

app.post('/cloudMessage', (req, res) => {

  const data = {
    registrationToken: req.body.registrationToken,
    title: req.body.title,
    body: req.body.body,
    imageUrl: req.body.imageUrl,
  }
  // console.log(data)
  firebase_Notification.send({
    token: data.registrationToken,
    notification: {
      title: data.title,
      body: data.body,
      imageUrl: data.imageUrl
    },
    topic: "test"
  }).then((response) => {
    res.send('Notification sent');
  }).catch((error) => {
    console.log(error)
  });
});

http.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});