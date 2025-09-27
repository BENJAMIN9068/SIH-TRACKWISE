const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();
const server = http.createServer(app);

// Socket.IO configuration for cPanel/shared hosting
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  // Additional options for shared hosting
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Import routes
const authRoutes = require('./routes/auth');
const staffRoutes = require('./routes/staff');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const apiRoutes = require('./routes/api');
const seatRoutes = require('./routes/seats');
const seedRoutes = require('./routes/seed');

// Import AI Chatbot (with error handling)
let AIChatbotController;
try {
  AIChatbotController = require('./controllers/AIChatbotController');
} catch (error) {
  console.warn('AI Chatbot not available:', error.message);
}

// Trust proxy for cPanel/shared hosting
app.set('trust proxy', 1);

// Import and use maintenance mode middleware FIRST
const maintenanceMode = require('./middleware/maintenanceMode');
app.use(maintenanceMode);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : true,
  credentials: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '10mb' }));

// Session configuration for shared hosting
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'bus-tracking-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true
    },
    name: 'bus-tracking-session'
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
  // Don't exit in production, let cPanel handle restarts
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
});

// Initialize AI Chatbot if available
let aiChatbot;
if (AIChatbotController) {
  try {
    aiChatbot = new AIChatbotController();
  } catch (error) {
    console.warn('AI Chatbot initialization failed:', error.message);
  }
}

// Routes
app.use('/auth', authRoutes);
app.use('/staff', staffRoutes);
app.use('/admin', adminRoutes);
app.use('/public', publicRoutes);
app.use('/api', apiRoutes);
app.use('/api/seats', seatRoutes);
app.use('/seed', seedRoutes);

// Debug routes (safe, no secrets revealed)
app.use('/debug', require('./routes/debug'));

// AI Chatbot routes (if available)
if (aiChatbot) {
  app.post('/api/chat', (req, res) => aiChatbot.chat(req, res));
  app.get('/api/bus-suggestions', (req, res) => aiChatbot.getBusSuggestions(req, res));
  app.get('/api/help', (req, res) => aiChatbot.getContextualHelp(req, res));
}

// Main homepage route
app.get('/', (req, res) => {
  res.render('index');
});

// Health check for cPanel monitoring
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.render('404');
  } else if (req.accepts('json')) {
    res.json({ error: 'Not found' });
  } else {
    res.type('txt').send('Not found');
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500);
  
  if (process.env.NODE_ENV === 'development') {
    res.json({ error: err.message, stack: err.stack });
  } else {
    res.json({ error: 'Internal server error' });
  }
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

// Export both app and server for cPanel
module.exports = { app, server };

// Start server only if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Bus Tracking System running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️ Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
  });
}