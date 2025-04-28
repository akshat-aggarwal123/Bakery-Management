// app.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import morgan from 'morgan';
import http from 'http';
import { WebSocketServer } from 'ws';
import routes from './routes/index.js';
import rabbitmqService from './services/rabbitmqService.js';

// Load environment variables
dotenv.config();

// Create an Express app
const app = express();
const server = http.createServer(app);

// Set up WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received WebSocket message:', data);
      // Handle the message - you can add your WebSocket logic here
      ws.send(JSON.stringify({ status: 'received', message: 'Your message was received!' }));
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      ws.send(JSON.stringify({ error: 'Invalid message format' }));
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
  
  // Send a welcome message
  ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to WebSocket server' }));
});

// Middleware setup
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'], // Allow both frontend and backend origins
  credentials: true, // Enable cookies and credentials
}));
app.use(express.json()); // Parse JSON request bodies
app.use(cookieParser()); // Parse cookies

// Use Morgan for HTTP request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => console.log(message.trim()), // Pipe Morgan logs to console
  },
}));

// Import and use routes
app.use('/api', routes);

// Add a health check endpoint at the root level
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`, { stack: err.stack });
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Start the server
const startServer = async () => {
  try {
    // Connect to RabbitMQ
    await rabbitmqService.connect();
    console.log('RabbitMQ service initialized successfully.');

    // Start the Express server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`WebSocket server available at ws://localhost:${PORT}/ws`);
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down server...');
      try {
        await rabbitmqService.disconnect();
        console.log('RabbitMQ service disconnected.');
        server.close(() => {
          console.log('Express server closed.');
          process.exit(0);
        });
      } catch (error) {
        console.error('Error during shutdown:', error.message);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('Failed to initialize services:', error.message);
    // Don't exit - try to start anyway
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (with RabbitMQ issues)`);
      console.log(`WebSocket server available at ws://localhost:${PORT}/ws`);
    });
  }
};

startServer();

export default app;