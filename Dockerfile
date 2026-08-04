# Use Eclipse Temurin (Official OpenJDK) with Java 17 pre-installed
FROM eclipse-temurin:17-jdk-jammy

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install Node.js, npm, and dos2unix efficiently
RUN apt-get update && apt-get install -y --no-install-recommends \
    nodejs \
    npm \
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

# Force convert line endings and grant execution permissions
RUN dos2unix ./bin/elpl && chmod +x ./bin/elpl

EXPOSE 3000
CMD ["node", "server.js"]
