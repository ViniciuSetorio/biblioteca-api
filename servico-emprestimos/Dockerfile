FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

# Adicione esta linha para garantir que as variáveis de ambiente sejam passadas
ENV DATABASE_URL=${DATABASE_URL}
ENV GATEWAY_URL=${GATEWAY_URL}
ENV NODE_ENV=${NODE_ENV}

EXPOSE ${PORT:-3000}

USER node

CMD ["node", "src/server.js"]