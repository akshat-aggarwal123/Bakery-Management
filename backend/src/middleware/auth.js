// src/middleware/auth.js
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';

export const auth = async (req, res, next) => {
  // Read token from cookies (adjust key if needed)
  const token = req.cookies?.auth_token;
  if (!token) {
    return res.status(401).json({ error: 'Authentication token missing' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    console.log('Authenticated user:', user); // Log the authenticated user
    req.user = user;
    next();
  } catch (error) {
    console.error('Error verifying token:', error.message); // Log token verification errors
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const admin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
