FROM node:18-alpine

WORKDIR /app

# Install dependencies (caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build for production
RUN npm run build

# Expose port (Vite preview usually 4173, but we can configure it)
EXPOSE 4173

# Serve the app
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
