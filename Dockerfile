FROM node:20-slim
WORKDIR /app

# 1. Install font dependencies and a standard font pack
RUN apt-get update && apt-get install -y \
    fontconfig \
    fonts-dejavu \
    && rm -rf /var/lib/apt/lists/*

# 2. Refresh font cache
RUN fc-cache -f -v

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source
COPY . .

EXPOSE 3000

CMD ["npm", "start"]