# Use an official Node.js runtime as the base image
FROM node:lts-alpine3.21

# Set the working directory inside the container (create NFC Project directory)
WORKDIR /usr/src/app/NFC-project

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies
RUN npm install

# Copy all the application files into the 'NFC Project' folder
COPY . .

# Expose the application port (replace 3000 with your app's port if different)
EXPOSE 3000

# Define the command to run your application
CMD ["npm", "start"]
