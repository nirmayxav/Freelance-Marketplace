const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token =
      req.header('Authorization')?.replace('Bearer ', '') ||
      req.headers?.token ||
      req.socket?.handshake?.auth?.token;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    next(); // Proceed to the next middleware/route
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = protect;
