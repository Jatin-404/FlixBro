# File: server/Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all other source code files
COPY . .

# Expose port
EXPOSE 5000

# Start command
CMD ["node", "server.js"]