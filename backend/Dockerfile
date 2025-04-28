# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies for Alpine (required for native modules like bcrypt)
RUN apk add --no-cache python3 make g++ git

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install dependencies with legacy peer dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Generate the Prisma client
RUN npx prisma generate

# Make the wait-for-db script executable
RUN chmod +x ./wait-for-db.sh

# Expose the port the app runs on
EXPOSE 3000

# Start the application using the wait-for-db script
CMD ["./wait-for-db.sh"]