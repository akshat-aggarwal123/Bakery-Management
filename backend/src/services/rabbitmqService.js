// services/rabbitmqService.js
import amqp from 'amqplib';
import { parseRabbitMQURL } from '../models/rabbitmqConfig.js';

class RabbitMQService {
  constructor(rabbitMqUrl) {
    this.rabbitMqUrl = rabbitMqUrl;
    this.connection = null;
    this.channel = null;
    this.queues = [
      'auth_queue', 
      'cart_queue', 
      'order_queue', 
      'register_queue', 
      'product_queue'
    ];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10; // Increased for more resilience
    this.reconnectDelay = 5000; // 5 seconds
    this.isConnecting = false;
  }

  async connect() {
    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting) {
      console.log('Connection attempt already in progress');
      return;
    }

    this.isConnecting = true;
    
    try {
      // Don't parse the URL, just use it directly to avoid parsing errors
      console.log('Connecting to RabbitMQ with URL:', this.rabbitMqUrl.replace(/:[^:]*@/, ':****@')); // Log URL with hidden password
      
      this.connection = await amqp.connect(this.rabbitMqUrl);
      
      console.log('RabbitMQ connection established successfully');
      
      // Set up connection event handlers
      this.connection.on('error', (err) => {
        console.error('RabbitMQ connection error:', err.message);
        if (!this.isConnecting) {
          this.attemptReconnect();
        }
      });
      
      this.connection.on('close', () => {
        console.log('RabbitMQ connection closed');
        if (!this.isConnecting) {
          this.attemptReconnect();
        }
      });
      
      // Create channel
      this.channel = await this.connection.createChannel();
      console.log('RabbitMQ channel created successfully');
      
      // Assert all queues with error handling for each queue
      for (const queue of this.queues) {
        try {
          await this.channel.assertQueue(queue, { durable: true });
          console.log(`Initialized queue: ${queue}`);
        } catch (queueError) {
          console.error(`Failed to assert queue ${queue}:`, queueError.message);
          // Continue with other queues
        }
      }
      
      // Reset reconnect attempts after successful connection
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      console.log('Successfully connected to RabbitMQ and initialized all queues');
      return true;
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error.message);
      this.isConnecting = false;
      this.attemptReconnect();
      return false;
    }
  }
  
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect to RabbitMQ (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectDelay/1000} seconds...`);
      
      setTimeout(() => {
        this.connect().catch(err => {
          console.error('Reconnection attempt failed:', err.message);
        });
      }, this.reconnectDelay);
    } else {
      console.error(`Failed to reconnect to RabbitMQ after ${this.maxReconnectAttempts} attempts`);
    }
  }

  async publish(queueName, message) {
    try {
      if (!this.channel) {
        console.warn(`RabbitMQ channel not available for publishing to ${queueName}, attempting to reconnect`);
        const connected = await this.connect();
        if (!connected) {
          throw new Error('RabbitMQ channel not initialized and reconnection failed.');
        }
      }
      
      if (!message || typeof message !== 'object') {
        throw new Error('Invalid message format. Expected a non-empty object.');
      }

      // Assert the queue again to ensure it exists
      await this.channel.assertQueue(queueName, { durable: true });
      
      await this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
      console.log(`Message published to ${queueName}:`, message);
      return true;
    } catch (error) {
      console.error(`Failed to publish to ${queueName}:`, error.message);
      // Don't throw here - just return false to prevent app crashes
      return false;
    }
  }

  async consume(queueName, callback) {
    try {
      if (!this.channel) {
        console.warn(`RabbitMQ channel not available for consuming from ${queueName}, attempting to reconnect`);
        const connected = await this.connect();
        if (!connected) {
          throw new Error('RabbitMQ channel not initialized and reconnection failed.');
        }
      }

      // Assert the queue again to ensure it exists
      await this.channel.assertQueue(queueName, { durable: true });
      
      this.channel.consume(
        queueName,
        (msg) => {
          if (msg !== null) {
            try {
              const content = JSON.parse(msg.content.toString());
              callback(content);
              this.channel.ack(msg);
            } catch (parseError) {
              console.error('Failed to parse message:', parseError.message);
              // Nack the message so it goes back to the queue
              this.channel.nack(msg);
            }
          }
        },
        { noAck: false }
      );
      console.log(`Consuming messages from ${queueName}`);
      return true;
    } catch (error) {
      console.error(`Failed to consume from ${queueName}:`, error.message);
      // Don't throw here - just return false to prevent app crashes
      return false;
    }
  }

  async disconnect() {
    try {
      if (this.channel) {
        await this.channel.close();
        console.log('Closed RabbitMQ channel');
      }
      if (this.connection) {
        await this.connection.close();
        console.log('Closed RabbitMQ connection');
      }
      return true;
    } catch (error) {
      console.error('Failed to disconnect from RabbitMQ:', error.message);
      return false;
    }
  }
}

// Create a singleton instance
const instance = new RabbitMQService(process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672/');

export default instance;