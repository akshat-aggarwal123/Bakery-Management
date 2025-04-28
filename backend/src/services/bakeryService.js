// src/services/bakeryService.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import rabbitmqService from './rabbitmqService.js';

// Initialize RabbitMQ service is now handled via the singleton import

// User Registration
export const registerUser = async (email, password, is_Admin = false) => {
  try {
    // Validate email format
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email format');
    }

    // Validate password length
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Use the same environment variable as in the controller
    const allowAdminRegistration = process.env.ALLOW_ADMIN_CREATION === 'true';
    const isAdmin = allowAdminRegistration ? is_Admin : false;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Proceed with user creation
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        isAdmin: isAdmin,
      },
    });

    // Publish to register_queue AFTER user is created - using non-awaited call to prevent blocking
    rabbitmqService.publish('register_queue', {
      type: 'user_registered',
      data: { id: user.id, email: user.email, isAdmin: user.isAdmin }
    }).catch(mqError => {
      console.error('Failed to publish to RabbitMQ:', mqError.message);
      // Don't fail the registration if RabbitMQ fails
    });

    return user;
  } catch (error) {
    console.error('Registration Error:', error.message);
    throw new Error(error.message || 'Registration failed');
  }
};

// User Login
export const loginUser = async (email, password) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }
    
    // Publish to auth_queue - using non-awaited call to prevent blocking
    rabbitmqService.publish('auth_queue', {
      type: 'user_logged_in',
      data: { email, timestamp: new Date() }
    }).catch(mqError => {
      console.error('Failed to publish login event to RabbitMQ:', mqError.message);
    });
    
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Login Error:', error.message);
    throw new Error(error.message || 'Login failed');
  }
};

// Create Product
export const createProduct = async (name, price, quantity, creatorId) => {
  try {
    const product = await prisma.product.create({
      data: { name, price, quantity, creatorId },
    });
    
    // Publish to product_queue - using non-awaited call to prevent blocking
    rabbitmqService.publish('product_queue', {
      type: 'product_created',
      data: { id: product.id, name, price, quantity }
    }).catch(mqError => {
      console.error('Failed to publish product creation to RabbitMQ:', mqError.message);
    });
    
    return product;
  } catch (error) {
    console.error('Create Product Error:', error.message);
    throw new Error(error.message || 'Failed to create product');
  }
};

// List Products
export const listProducts = async () => {
  try {
    return await prisma.product.findMany();
  } catch (error) {
    console.error('List Products Error:', error.message);
    throw new Error('Failed to fetch products');
  }
};

// Place Order
export const placeOrder = async (userId, productId, quantity) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.quantity < quantity) {
      throw new Error('Product not available');
    }

    // Update product quantity
    await prisma.product.update({
      where: { id: productId },
      data: { quantity: product.quantity - quantity },
    });

    // Create order in the database
    const order = await prisma.order.create({
      data: { userId, productId, quantity, status: 'pending' },
    });

    // Publish order details to RabbitMQ - using non-awaited call to prevent blocking
    rabbitmqService.publish('order_queue', {
      type: 'order_created',
      data: {
        orderId: order.id,
        userId,
        productId,
        quantity,
        status: 'pending',
      }
    }).catch(mqError => {
      console.error('Failed to publish order to RabbitMQ:', mqError.message);
    });

    return order;
  } catch (error) {
    console.error('Place Order Error:', error.message);
    throw new Error(error.message || 'Failed to place order');
  }
};

// Get Order Status
export const getOrderStatus = async (orderId) => {
  try {
    return await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true },
    });
  } catch (error) {
    console.error('Get Order Status Error:', error.message);
    throw new Error('Failed to fetch order status');
  }
};

// List Users
export const listUsers = async () => {
  try {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        // Don't include password
      }
    });
  } catch (error) {
    console.error('List Users Error:', error.message);
    throw new Error('Failed to fetch users');
  }
};

// Add to Cart
export const addToCart = async (userId, productId, quantity) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error('Product not found');

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          user: { connect: { id: userId } },
          items: {
            create: {
              product: { connect: { id: productId } },
              quantity,
            },
          },
        },
        include: { items: true },
      });
    } else {
      const existingItem = cart.items.find((item) => item.productId === productId);
      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cart: { connect: { id: cart.id } },
            product: { connect: { id: productId } },
            quantity,
          },
        });
      }
      cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
      });
    }

    // Publish to cart_queue - using non-awaited call to prevent blocking
    rabbitmqService.publish('cart_queue', {
      type: 'cart_updated',
      data: { userId, productId, quantity }
    }).catch(mqError => {
      console.error('Failed to publish cart update to RabbitMQ:', mqError.message);
    });

    return cart;
  } catch (error) {
    console.error('Add to Cart Error:', error.message);
    throw new Error(error.message || 'Failed to add item to cart');
  }
};

// Get Cart
export const getCart = async (userId) => {
  try {
    return await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  } catch (error) {
    console.error('Get Cart Error:', error.message);
    throw new Error('Failed to fetch cart');
  }
};