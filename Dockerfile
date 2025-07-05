FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

# Install all dependencies (including dev dependencies for development)
RUN npm ci --include=dev

COPY . .

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 8080

# Use nodemon for development, node for production
CMD ["npm", "start"]
