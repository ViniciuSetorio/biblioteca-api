FROM node:20-alpine

WORKDIR /app

# Copiar package.json primeiro
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Verificar versão do Node (deve ser >= 20.6.0)
RUN node --version

# Expor porta
EXPOSE 3000

# Comando para desenvolvimento (com --watch)
CMD ["npm", "run", "dev"]