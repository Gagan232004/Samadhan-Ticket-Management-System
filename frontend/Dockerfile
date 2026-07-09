FROM oven/bun:1.0 AS builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY bun.lock ./

# Install dependencies
RUN bun install

# Copy application code
COPY . .

# Build the frontend (Vite builds to /dist by default)
RUN bun run build

# Use a lightweight nginx image to serve the static files
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
