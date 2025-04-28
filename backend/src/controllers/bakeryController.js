// controllers/authController.js
import { auth, admin } from '../middleware/auth.js';
import { 
  registerUser, 
  loginUser, 
  listUsers, 
  createProduct as createProductService,
  listProducts, 
  placeOrder, 
  getOrderStatus,
  addToCart as addToCartService,
  getCart as getCartService
} from '../services/bakeryService.js';

// Register Controller
export const register = async (req, res) => {
  try {
    const { email, password, isAdmin } = req.body;

    // Log the request IP for debugging
    console.log('Request IP:', req.ip);

    // Determine if admin creation is allowed
    const isLocalhost =
      ['127.0.0.1', '::1'].includes(req.ip) ||
      req.ip.startsWith('::ffff:127.') ||
      req.ip.startsWith('172.'); // Add Docker bridge network IPs

    // Use the same environment variable as in bakeryService.js
    const isAdminAllowed = process.env.ALLOW_ADMIN_CREATION === 'true' || isLocalhost;
    const finalIsAdmin = isAdminAllowed ? Boolean(isAdmin) : false;

    console.log('Final isAdmin value:', finalIsAdmin);

    // Register the user
    const user = await registerUser(email, password, finalIsAdmin);

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await loginUser(email, password);
    
    res.cookie('auth_token', token, { httpOnly: true });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// Get All Users (Admin Only)
export const getUsers = [auth, admin, async (req, res) => {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}];

// Create Product (Admin Only)
export const createProduct = [auth, admin, async (req, res) => {
  try {
    const { name, price, quantity } = req.body;
    
    if (!name || !price || !quantity) {
      return res.status(400).json({ error: 'Missing required fields: name, price, and quantity are required' });
    }
    
    // Use the renamed service function
    const product = await createProductService(name, parseFloat(price), parseInt(quantity, 10), req.user.id);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}];

// Get All Products
export const getProducts = async (req, res) => {
  try {
    const products = await listProducts();
    console.log('Fetched all products');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create Order (Authenticated User)
export const createOrder = [auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId || !quantity) {
      return res.status(400).json({ error: 'Product ID and quantity are required' });
    }
    
    const order = await placeOrder(req.user.id, parseInt(productId, 10), parseInt(quantity, 10));
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}];

// Get Order Status (Authenticated User)
export const getOrder = [auth, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    
    const order = await getOrderStatus(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}];

// Add to Cart Controller
export const addToCart = [auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      return res.status(400).json({ error: 'Product ID and quantity are required' });
    }
    
    const cart = await addToCartService(
      req.user.id, 
      parseInt(productId, 10), 
      parseInt(quantity, 10)
    );
    
    res.json(cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}];

// Get Cart Controller
export const getCart = [auth, async (req, res) => {
  try {
    const cart = await getCartService(req.user.id);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}];

// Logout Controller
export const logout = (req, res) => {
  res.clearCookie('auth_token');
  res.json({ message: 'Logout successful' });
};