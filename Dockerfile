FROM ubuntu:22.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install Node.js, npm, Java JDK, and core utilities
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    default-jdk \
    dos2unix \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Copy application files and your binary
COPY server.js ./
COPY bin/ ./bin/

# Force convert line endings just in case and grant execution permissions
RUN dos2unix ./bin/elpl && chmod +x ./bin/elpl

EXPOSE 3000
CMD ["node", "server.js"]
