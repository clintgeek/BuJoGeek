FROM node:18-alpine as build

# Install curl for debugging
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --verbose > /tmp/npm_install.log 2>&1 || (echo "npm install failed" && cat /tmp/npm_install.log && exit 1)

# Copy application code
COPY . .

# Set build arguments
ARG BACKEND_PORT=5000
ENV BACKEND_PORT=$BACKEND_PORT
ENV NODE_ENV=production
ENV VITE_BASE_URL=/client/dist/

# Debug: List contents before build
RUN sh -c 'echo "=== Contents before build ===" > /tmp/pre_build.log; \
    echo "Current directory: $(pwd)" >> /tmp/pre_build.log; \
    echo "Directory contents:" >> /tmp/pre_build.log; \
    ls -la >> /tmp/pre_build.log; \
    echo "Environment variables:" >> /tmp/pre_build.log; \
    env >> /tmp/pre_build.log; \
    cat /tmp/pre_build.log'

# Build the application with verbose output
RUN npm run build --verbose > /tmp/build.log 2>&1 || (echo "Build failed" && cat /tmp/build.log && exit 1)

# Debug: List contents after build
RUN sh -c 'echo "=== Contents after build ===" > /tmp/post_build.log; \
    echo "Current directory: $(pwd)" >> /tmp/post_build.log; \
    echo "Directory contents:" >> /tmp/post_build.log; \
    ls -la >> /tmp/post_build.log; \
    echo "=== Contents of dist directory ===" >> /tmp/post_build.log; \
    if [ -d "dist" ]; then \
        ls -la dist/ >> /tmp/post_build.log; \
        echo "=== Contents of index.html ===" >> /tmp/post_build.log; \
        if [ -f "dist/index.html" ]; then \
            cat dist/index.html >> /tmp/post_build.log; \
        else \
            echo "index.html not found in dist directory" >> /tmp/post_build.log; \
        fi; \
    else \
        echo "dist directory not found" >> /tmp/post_build.log; \
        exit 1; \
    fi; \
    cat /tmp/post_build.log'

# Production stage
FROM nginx:alpine

# Install curl for debugging
RUN apk add --no-cache curl

# Create log directories
RUN mkdir -p /var/log/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chmod -R 755 /var/log/nginx

# Copy build logs from build stage
COPY --from=build /tmp/*.log /tmp/

# Create the web root directory and ensure proper permissions
RUN mkdir -p /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Copy the build output with verbose logging
RUN echo "=== Copying build output ===" > /tmp/copy.log && \
    echo "Source: /app/dist/" >> /tmp/copy.log && \
    echo "Destination: /usr/share/nginx/html/" >> /tmp/copy.log

COPY --from=build /app/dist/ /usr/share/nginx/html/

# Debug: List contents in nginx
RUN sh -c 'echo "=== Contents in nginx web root ===" > /tmp/nginx_setup.log; \
    echo "Current directory: $(pwd)" >> /tmp/nginx_setup.log; \
    echo "Directory contents:" >> /tmp/nginx_setup.log; \
    ls -la /usr/share/nginx/html >> /tmp/nginx_setup.log; \
    echo "=== Checking for index.html ===" >> /tmp/nginx_setup.log; \
    if [ -f "/usr/share/nginx/html/index.html" ]; then \
        echo "index.html exists" >> /tmp/nginx_setup.log; \
        echo "index.html contents:" >> /tmp/nginx_setup.log; \
        cat /usr/share/nginx/html/index.html >> /tmp/nginx_setup.log; \
    else \
        echo "index.html is missing" >> /tmp/nginx_setup.log; \
        exit 1; \
    fi; \
    cat /tmp/nginx_setup.log'

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start Nginx with logging enabled
CMD ["nginx", "-g", "daemon off;"]