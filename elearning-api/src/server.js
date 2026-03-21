require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();

// Middleware
app.use(cors()); // In production, you might want to restrict this to your Vercel domain
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static (Only for local development)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic Route for Testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to e-Learning API (Vercel Ready)' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start Server (Only when not running as a Vercel function)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (e) {
    // Port might be in use or other error
  }
}

module.exports = app;