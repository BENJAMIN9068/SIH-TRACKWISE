const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Import routes
const authRoutes = require('./routes/auth');
const staffRoutes = require('./routes/staff');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const apiRoutes = require('./routes/api');
const seatRoutes = require('./routes/seats');


// Import AI Chatbot
const AIChatbotController = require('./controllers/AIChatbotController');

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'bus-tracking-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
  })
);

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));


// Database connection
const { connectDB } = require('./config/database');

// Connect to MongoDB Atlas
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  } else {
    console.log('⚠️ Continuing without database connection for local development');
  }
});

// Initialize AI Chatbot
const aiChatbot = new AIChatbotController();

// Routes
app.use('/auth', authRoutes);
app.use('/staff', staffRoutes);
app.use('/admin', adminRoutes);
app.use('/public', publicRoutes);
app.use('/api', apiRoutes);
app.use('/api/seats', seatRoutes);

// Debug routes (safe, no secrets revealed)
app.use('/debug', require('./routes/debug'));

// AI Chatbot routes
app.post('/api/chat', (req, res) => aiChatbot.chat(req, res));
app.get('/api/bus-suggestions', (req, res) => aiChatbot.getBusSuggestions(req, res));
app.get('/api/help', (req, res) => aiChatbot.getContextualHelp(req, res));

// Main homepage route
app.get('/', (req, res) => {
  res.render('index');
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404');
});

// Socket.IO connection handling
io.on('connection', socket => {
  console.log('User connected:', socket.id);

  // Join room for real-time updates
  socket.on('joinRoom', room => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  // Leave room
  socket.on('leaveRoom', room => {
    socket.leave(room);
    console.log(`User ${socket.id} left room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
