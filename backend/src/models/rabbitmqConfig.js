// models/rabbitmqConfig.js
import { URL } from 'url';

export const parseRabbitMQURL = (rabbitMqUrl) => {
  try {
    if (!rabbitMqUrl || typeof rabbitMqUrl !== 'string') {
      throw new Error('Invalid RabbitMQ URL provided');
    }

    // Handle special characters in credentials properly
    // First check if it's a valid URL format
    if (!rabbitMqUrl.includes('://')) {
      throw new Error('Invalid URL format: missing protocol');
    }

    const [protocol, rest] = rabbitMqUrl.split('://');
    
    // Extract credentials and hostname parts
    let credentials, hostPart;
    if (rest.includes('@')) {
      [credentials, hostPart] = rest.split('@');
    } else {
      credentials = '';
      hostPart = rest;
    }

    // Extract username and password
    let username = '', password = '';
    if (credentials && credentials.includes(':')) {
      [username, password] = credentials.split(':');
    }

    // Parse the host part
    let hostname, port = '5672', vhost = '/';
    if (hostPart.includes(':')) {
      [hostname, port] = hostPart.split(':');
      if (port.includes('/')) {
        [port, vhost] = port.split('/');
        vhost = '/' + vhost;
      }
    } else {
      hostname = hostPart;
      if (hostname.includes('/')) {
        [hostname, vhost] = hostname.split('/');
        vhost = '/' + vhost;
      }
    }

    return {
      protocol: protocol + '://',
      hostname,
      port,
      username: decodeURIComponent(username),
      password: decodeURIComponent(password),
      vhost: vhost === '/' ? '/' : vhost,
      full: `${protocol}://${username}:${password}@${hostname}:${port}${vhost}`
    };
  } catch (error) {
    console.error('Failed to parse RabbitMQ URL:', error.message);
    // Don't throw here - return a helpful error object instead
    return {
      error: 'RabbitMQ URL parsing failed: ' + error.message,
      originalUrl: rabbitMqUrl
    };
  }
};