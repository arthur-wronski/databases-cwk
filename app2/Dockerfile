# Use the specified Node.js version
FROM node:20.9.0-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of your application's code into the Docker image
COPY . .

# Copy the data directory into the Docker image
COPY data/ /usr/src/app/data/

# Expose the port your app runs on
EXPOSE 3000

# Run your Node.js app
CMD ["npm", "start"]
