FROM node:20-alpine

WORKDIR /app

# Install dependencies first for optimal layer caching
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY src/ ./src/

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "src/server.js"]
