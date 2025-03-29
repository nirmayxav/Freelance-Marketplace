# Use Node.js as the base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --force


# Copy all frontend files
COPY . .

# Expose frontend port
EXPOSE 3000

# Start the React app
CMD ["npm", "start"]
