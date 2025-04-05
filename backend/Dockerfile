# Use Node.js as the base image
FROM node:18

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --force

# Copy the rest of the application files
COPY . .

# Expose backend port
EXPOSE 5001

# Start the backend server
CMD ["npm", "start"]
