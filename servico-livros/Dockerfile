FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependência primeiro
COPY package*.json ./
RUN npm install

# Copiar o resto do código
COPY . .

EXPOSE 3002

CMD ["node", "src/server.js"]
