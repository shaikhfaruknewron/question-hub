# Debian-slim rather than Alpine: glibc avoids native-module surprises.
FROM node:22-slim

WORKDIR /app

# Copied first so `npm ci` is only re-run when the dependencies actually change.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
