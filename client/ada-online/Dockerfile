# Stage 1: Build the React application
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package.json package-lock.json ./

# Install dependencies using npm ci for faster, more reliable builds
RUN npm ci

# Copy the rest of the application code
COPY . .

# Define build-time argument for the backend URL
ARG VITE_SERVER_URL

# Set the environment variable for the build process
ENV VITE_SERVER_URL=$VITE_SERVER_URL

# Build the application
RUN npm run build

# Stage 2: Serve the built application with Nginx
FROM nginx:1.25-alpine

# Copy the build output from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 (as defined in nginx.conf)
EXPOSE 8080

# Command to run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
