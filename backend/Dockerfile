FROM oven/bun:1.0

WORKDIR /app

# Copy package files
COPY package.json ./
COPY bun.lock ./
COPY prisma ./prisma/

# Install dependencies
RUN bun install

# Generate Prisma client
RUN bunx prisma generate

# Copy the rest of the application code
COPY . .

# Expose port
EXPOSE 5000

# Start the server
CMD ["bun", "run", "index.ts"]
