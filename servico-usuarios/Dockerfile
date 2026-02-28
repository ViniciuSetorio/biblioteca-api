FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

EXPOSE ${PORT:-3001}

USER node

CMD ["node", "src/server.js"]