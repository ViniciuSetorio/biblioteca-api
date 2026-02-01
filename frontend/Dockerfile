FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Instalar servidor para servir os arquivos estáticos
RUN npm install -g serve

# Expor porta
EXPOSE 5173

# Comando para servir os arquivos buildados
CMD ["serve", "-s", "dist", "-l", "5173"]