FROM node:18-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Set build arguments
ARG BACKEND_PORT=5000
ENV BACKEND_PORT=$BACKEND_PORT
ENV NODE_ENV=production

# Debug: List contents before build
RUN echo "=== Contents before build ===" && ls -la

# Build the application with verbose output
RUN npm run build --verbose || (echo "Build failed" && exit 1)

# Debug: List contents after build
RUN echo "=== Contents after build ===" && \
    echo "=== Contents of /app ===" && ls -la && \
    echo "=== Contents of /app/dist ===" && ls -la dist/ || (echo "dist directory not found" && exit 1)

# Production stage
FROM nginx:alpine

# Create the web root directory
RUN mkdir -p /usr/share/nginx/html

# Copy the build output
COPY --from=build /app/dist/ /usr/share/nginx/html/

# Debug: List contents in nginx
RUN echo "=== Contents in nginx web root ===" && \
    echo "=== Contents of /usr/share/nginx/html ===" && ls -la /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]