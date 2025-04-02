const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate users via JWT token
 */
const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

/**
 * Middleware to check if user has admin privileges
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Admin privileges required' });
  }
};

/**
 * Middleware to check if user is authorized for a group
 * Either as admin, group_owner of the specific group, or contributor/reader with access
 */
const authorizeGroup = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    const groupId = req.params.groupId || req.body.group_id;
    
    // Admins have access to all groups
    if (role === 'admin') {
      return next();
    }
    
    if (role === 'group_owner') {
      // Need to check if this user owns this group (would require a DB lookup)
      // This is a placeholder, implement actual check
      next();
    } else if (role === 'contributor' || role === 'reader') {
      // Need to check if this user has access to this group (would require a DB lookup)
      // This is a placeholder, implement actual check
      next();
    } else {
      res.status(403).json({ msg: 'Not authorized for this group' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { auth, adminOnly, authorizeGroup }; 