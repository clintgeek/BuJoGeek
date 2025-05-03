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
RUN echo "\n=== Contents before build ===" && \
    echo "Current directory:" && pwd && \
    echo "\nDirectory contents:" && ls -la

# Build the application with verbose output
RUN npm run build --verbose || (echo "Build failed" && exit 1)

# Debug: List contents after build
RUN echo "\n=== Contents after build ===" && \
    echo "Current directory:" && pwd && \
    echo "\nDirectory contents:" && ls -la && \
    echo "\n=== Contents of dist directory ===" && \
    ls -la dist/ || (echo "dist directory not found" && exit 1)

# Production stage
FROM nginx:alpine

# Create the web root directory
RUN mkdir -p /usr/share/nginx/html

# Copy the build output
COPY --from=build /app/dist/ /usr/share/nginx/html/

# Debug: List contents in nginx
RUN echo "\n=== Contents in nginx web root ===" && \
    echo "Current directory:" && pwd && \
    echo "\nDirectory contents:" && ls -la /usr/share/nginx/html && \
    echo "\n=== Checking for index.html ===" && \
    if [ -f /usr/share/nginx/html/index.html ]; then \
        echo "index.html exists" && \
        echo "index.html contents:" && \
        cat /usr/share/nginx/html/index.html; \
    else \
        echo "index.html is missing"; \
    fi

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]