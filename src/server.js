const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const friendRoutes = require('./routes/friend.routes');
const messageRoutes = require('./routes/message.routes');
const mediaRoutes = require('./routes/media.routes');
const { setupWebSocket } = require('./services/socket.service');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/media', mediaRoutes);

// WebSocket setup
setupWebSocket(io);

// Error handling
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});