const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const svgRoutes = require('./routes/svgRoutes');
const configRoutes = require('./routes/configRoutes');
const templateRoutes = require('./routes/templateRoutes');

// Import database connection (if using MongoDB)
if (process.env.MONGODB_URI) {
  require('./config/database');
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Create directory for saved SVGs if it doesn't exist
const saveDir = process.env.SAVE_DIR || './generated';
if (!fs.existsSync(saveDir)) {
  fs.mkdirSync(saveDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/svg', svgRoutes);
app.use('/api/config', configRoutes);
app.use('/api/templates', templateRoutes);

// Default route - serves the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', version: process.env.npm_package_version });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`SVG Generator server running on port ${PORT}`);
});

module.exports = app; // For testing
