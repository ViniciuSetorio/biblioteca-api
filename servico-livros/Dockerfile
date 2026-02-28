FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# ✅ Variáveis para os MICROSSERVIÇOS
ENV DATABASE_URL=${DATABASE_URL}
ENV GATEWAY_URL=${GATEWAY_URL}
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}

EXPOSE ${PORT:-3001}

CMD ["node", "src/server.js"]