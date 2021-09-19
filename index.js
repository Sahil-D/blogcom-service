const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
// const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morganMiddleware = require('./middlewares/morgan');
const ErrorMessages = require('./utils/ErrorMessages');
const httpStatus = require('http-status');
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
  res.send('Hello GET Request');
});

app.use('/api/user', userRoute);
app.use('/api/post', postRoute);
app.use('/api/conversation', conversationRoute);
app.use('/api/message', messageRoute);

// have to work on auth as middleware using JWT's

initErrorHandlers(app);

app.listen(PORT, () => {
  console.log('Server running at PORT : ', PORT);
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
