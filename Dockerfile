cat > infrastructure/docker/Dockerfile.dev << 'EOF'
FROM node:18-alpine

# Install development tools
RUN apk add --no-cache python3 make g++ curl git

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose ports
EXPOSE 3000 9229

# Development command
CMD ["npm", "run", "dev:simple"]
EOF

