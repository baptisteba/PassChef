const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');

// @route   POST /api/admin/reset-database
// @desc    Reset database (admin only - with specific email check)
// @access  Private + Email check
router.post('/reset-database', auth, async (req, res) => {
  try {
    // Only baptiste.debut@passman.fr can reset the database
    // This is intentionally hardcoded rather than using a role,
    // as this is a very dangerous operation
    if (req.user.email !== 'baptiste.debut@passman.fr') {
      return res.status(403).json({ msg: 'You are not authorized to perform this action' });
    }
    
    // Get all collections in the database
    const collections = await mongoose.connection.db.collections();
    
    // Drop each collection except users
    for (let collection of collections) {
      const collectionName = collection.collectionName;
      
      // Skip the users collection to maintain admin access
      if (collectionName !== 'users') {
        await mongoose.connection.db.dropCollection(collectionName);
        console.log(`Dropped collection: ${collectionName}`);
      }
    }
    
    res.json({ msg: 'Database reset successfully. All data has been deleted except for user accounts.' });
  } catch (err) {
    console.error('Database reset error:', err.message);
    res.status(500).json({ msg: 'Server error during database reset' });
  }
});

module.exports = router; 