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
RUN set -x && \
    echo "=== Contents before build ===" > /tmp/build.log && \
    pwd >> /tmp/build.log && \
    ls -la >> /tmp/build.log && \
    cat /tmp/build.log

# Build the application with verbose output
RUN npm run build --verbose || (echo "Build failed" && exit 1)

# Debug: List contents after build
RUN set -x && \
    echo "=== Contents after build ===" > /tmp/build.log && \
    echo "=== Contents of /app ===" >> /tmp/build.log && \
    pwd >> /tmp/build.log && \
    ls -la >> /tmp/build.log && \
    echo "=== Contents of /app/dist ===" >> /tmp/build.log && \
    ls -la dist/ >> /tmp/build.log 2>&1 || (echo "dist directory not found" >> /tmp/build.log) && \
    cat /tmp/build.log

# Production stage
FROM nginx:alpine

# Create the web root directory
RUN mkdir -p /usr/share/nginx/html

# Copy the build output
COPY --from=build /app/dist/ /usr/share/nginx/html/

# Debug: List contents in nginx
RUN set -x && \
    echo "=== Contents in nginx web root ===" > /tmp/nginx.log && \
    echo "=== Contents of /usr/share/nginx/html ===" >> /tmp/nginx.log && \
    pwd >> /tmp/nginx.log && \
    ls -la /usr/share/nginx/html >> /tmp/nginx.log && \
    echo "=== Checking for index.html ===" >> /tmp/nginx.log && \
    test -f /usr/share/nginx/html/index.html && echo "index.html exists" >> /tmp/nginx.log || echo "index.html missing" >> /tmp/nginx.log && \
    cat /tmp/nginx.log

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]