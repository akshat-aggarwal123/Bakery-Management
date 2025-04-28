// routes/index.js
import express from 'express';
import { auth, admin } from '../middleware/auth.js';
import * as authController from '../controllers/bakeryController.js';
import rabbitmqService from '../services/rabbitmqService.js';

const router = express.Router();

// Health check endpoint for Docker
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

/**
 * Admin Routes
 * These routes are accessible only to authenticated users with admin privileges.
 */
router.get('/users', [auth, admin], authController.getUsers); // Fetch all users (Admin only)
router.post('/products', [auth, admin], authController.createProduct); // Create a new product (Admin only)

/**
 * Public Routes
 * These routes are accessible to all users without authentication.
 */
router.post('/register', authController.register); // Register a new user
router.post('/login', authController.login); // Login a user
router.get('/products', authController.getProducts); // Fetch all products (Public)

/**
 * Protected Routes
 * These routes require authentication via the `auth` middleware.
 */
router.post('/orders', auth, authController.createOrder);
router.get('/orders/:id', auth, authController.getOrder); // Fetch a specific order by ID

/**
 * Cart Routes
 * These routes manage the user's cart and require authentication.
 */
router.post('/cart', auth, authController.addToCart); // Add an item to the cart
router.get('/cart', auth, authController.getCart); // Fetch the user's cart

/**
 * RabbitMQ-Specific Routes
 * These routes are used to interact with RabbitMQ for testing or debugging purposes.
 */
// Simulate consuming messages from RabbitMQ
router.get('/consume-orders', auth, async (req, res) => {
  try {
    let consumedMessages = [];
    // Consume messages from RabbitMQ
    const success = await rabbitmqService.consume('order_queue', (message) => {
      consumedMessages.push(message);
    });
    
    if (!success) {
      return res.status(500).json({ message: 'Failed to set up message consumer' });
    }
    
    // Respond with the consumed messages
    res.status(200).json({ message: 'Message consumer set up successfully' });
  } catch (error) {
    console.error('Error consuming messages:', error.message);
    res.status(500).json({ message: 'Failed to consume messages' });
  }
});

/**
 * Logout Route
 * Clears the authentication token cookie and logs the user out.
 */
router.post('/logout', authController.logout);

router.get('/consume-auth', auth, async (req, res) => {
  try {
    let consumedMessages = [];
    const success = await rabbitmqService.consume('auth_queue', (message) => {
      consumedMessages.push(message);
    });
    
    if (!success) {
      return res.status(500).json({ message: 'Failed to set up auth consumer' });
    }
    
    res.status(200).json({ message: 'Auth consumer set up successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to consume auth events' });
  }
});

/**
 * Validate Token Route
 * Validates the user's authentication token and returns the user's details.
 */
router.get('/validate-token', auth, (req, res) => {
  res.json({ user: req.user }); // Return the authenticated user's details
});

// WebSocket route test
router.get('/ws', (req, res) => {
  res.status(200).json({ message: 'WebSocket endpoint should be accessed via ws:// protocol, not http://' });
});

export default router;