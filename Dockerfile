# Stage 1: Build the React application
FROM node:20-alpine AS build

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package.json ./
COPY package-lock.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Build the React app for production
RUN npm run build

# ---

# Stage 2: Serve the static files using Nginx
FROM nginx:alpine AS production

# Copy the built React app from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy the custom Nginx configuration file
# This file configures Nginx to listen on port 3000
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000 for the web server
EXPOSE 3000

# Command to start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]