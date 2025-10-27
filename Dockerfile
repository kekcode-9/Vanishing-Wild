# Use a stable Node.js LTS (current stable is 20 LTS)
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for efficient caching)
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the app
COPY . .

# Expose the React dev server port
EXPOSE 3000

# Start the dev server
CMD ["npm", "start"]
