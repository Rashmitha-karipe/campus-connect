const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const header = req.headers.authorization; // "Bearer <token>"
  const token = header && header.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Please log in' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Access denied' });
    next();
  };
}

module.exports = { verifyToken, requireRole };
