# --- STAGE 1: Build Stage ---
FROM node:18-alpine as build

# Set the working directory
WORKDIR /app

# Install dependencies before copying the full code for caching
COPY package*.json ./
RUN npm install

# Copy all code and build the production bundle
COPY . .
RUN npm run build

# --- STAGE 2: Serve Stage ---
FROM nginx:stable-alpine

# Use custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from Stage 1 to Nginx serve directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port (Nginx default is 80)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
