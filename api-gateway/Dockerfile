FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Adicione esta linha para garantir que as variáveis de ambiente sejam passadas
ENV DATABASE_URL=${DATABASE_URL}
ENV GATEWAY_URL=${GATEWAY_URL}
ENV NODE_ENV=${NODE_ENV}

EXPOSE 3000

CMD ["node", "src/server.js"]
