// Main server entry point
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const siteRoutes = require('./routes/siteRoutes');
const documentRoutes = require('./routes/documentRoutes');
const wanRoutes = require('./routes/wanRoutes');
const externalToolRoutes = require('./routes/externalToolRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Configure CORS with more specific options
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/wan', wanRoutes);
app.use('/api/external-tools', externalToolRoutes);
app.use('/api/deployments', require('./routes/deploymentRoutes'));

// Admin routes
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Debug endpoint to verify server is running
app.get('/', (req, res) => {
  res.send('PassChef API server is running. Access the API at /api/*');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 