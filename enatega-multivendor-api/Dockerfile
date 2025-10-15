# syntax=docker/dockerfile:1
ARG NODE_VERSION=18.0.0
FROM node:${NODE_VERSION}-alpine

WORKDIR /usr/src/app

# Copy dependency files and install packages
COPY package.json package-lock.json ./
RUN npm install

# Copy app source code
COPY . .

# Make sure uploads folder exists and is writable by the 'node' user
RUN mkdir -p /usr/src/app/graphql/resolvers/uploads \
    && chown -R node:node /usr/src/app

# Switch to non-root user *after* permissions are fixed
USER node

EXPOSE 8001
CMD ["npm", "run", "start"]
