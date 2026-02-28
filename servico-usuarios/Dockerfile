FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

# ✅ ADICIONE ESTAS LINHAS (igual aos outros serviços)
ENV DATABASE_URL=${DATABASE_URL}
ENV GATEWAY_URL=${GATEWAY_URL}
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}

EXPOSE ${PORT:-3001}

USER node

CMD ["node", "src/server.js"]