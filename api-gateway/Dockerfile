FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE ${PORT:-3000}

CMD ["node", "src/server.js"]