const express = require('express');
const app = express();
const mongoose = require('mongoose');
const socket = require('socket.io');

const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const httpStatus = require('http-status');
const morganMiddleware = require('./middlewares/morgan');

const ErrorMessages = require('./utils/ErrorMessages');
const ApiError = require('./utils/ApiError');

const userRoute = require('./routes/user');
const postRoute = require('./routes/post');
const conversationRoute = require('./routes/conversation');
const messageRoute = require('./routes/message');

const PORT = process.env.PORT || 8080;

dotenv.config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true }, () => {
  console.log('MongoDB is connected');
});

app.use(cors());
// middleware like body parser
app.use(express.json());
app.use(helmet());
app.use(morganMiddleware);

app.get('/', (req, res) => {
  res.send('Welcome to BlogCom App Service');
});

app.use('/api/user', userRoute);
app.use('/api/post', postRoute);
app.use('/api/conversation', conversationRoute);
app.use('/api/message', messageRoute);

// have to work on auth as middleware using JWT's

// error handling part
initErrorHandlers(app);

const server = app.listen(PORT, () => {
  console.log('Server running at PORT : ', PORT);
});

// Socket Part
const io = socket(server, {
  cors: {
    origin: '*',
  },
});

let users = []; // List of all current users online { userId, socketId }

const addUser = (userId, socketId) => {
  users = users.filter((u) => u.userId !== userId);
  users.push({ userId, socketId }); // result : we are getting in users[] -> online participants
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

// connecting event
io.on('connection', (socket) => {
  console.log('New User Logged In with socket ID ' + socket.id);
  // take userId and socketId on every connection made because we can even have different socketId for same user also

  socket.on('addUser', (userId) => {
    addUser(userId, socket.id);
    io.emit('getUsers', users); // returning list of online users to client side at getUser event
  });

  // send and receive messages
  socket.on('sendMessage', ({ senderId, receiverId, text }) => {
    const user = users.find((u) => u.userId == receiverId); // opponent user

    if (user)
      io.to(user.socketId).emit('getMessage', {
        senderId,
        text,
      });
  });

  socket.on('disconnect', () => {
    console.log('A User disconnected with socket ID ' + socket.id);
    removeUser(socket.id);
    io.emit('getUsers', users); // returning list of modified online users to client side at getUser event
  });
});

function initErrorHandlers(app) {
  // 404 Error Handler
  app.use(function (req, res, next) {
    return res.status(404).send({ status: 'failure', error: 'Not Found' });
  });

  // General Error Handler
  app.use((error, req, res, next) => {
    console.log(error);
    if (error instanceof ApiError) {
      const statusCode = error.statusCode;
      let message = error.message;

      if (error.statusCode >= httpStatus.INTERNAL_SERVER_ERROR) {
        message = ErrorMessages.INTERNAL_SERVER_ERROR;
      }

      return res.status(statusCode).send({ status: 'failure', error: message });
    }

    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ status: 'failure', error: ErrorMessages.INTERNAL_SERVER_ERROR });
  });
}
