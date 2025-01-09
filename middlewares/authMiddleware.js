const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(403).json({ message: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1]; // Extract token from 'Bearer <token>'
    if (!token) {
      return res.status(403).json({ message: 'Access token is required' });
    }

    // Log the token for debugging
    console.log('Token received:', token);

    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      console.error('ACCESS_TOKEN_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server error: Missing JWT secret' });
    }

    // Verify the token
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Attach user information to the request
    next(); // Proceed to the next middleware
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { verifyToken };
