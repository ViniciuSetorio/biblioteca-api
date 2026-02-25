#!/bin/bash

echo "🚀 Preparando para deploy..."

# Verificar variáveis de ambiente
if [ -z "$RAILWAY_TOKEN" ]; then
  echo "❌ RAILWAY_TOKEN não configurado"
  exit 1
fi

# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login --token $RAILWAY_TOKEN

# Deploy cada serviço
for service in api-gateway servico-usuarios servico-livros servico-emprestimos servico-multas servico-notificacoes; do
  echo "📦 Deploying $service..."
  cd $service
  railway up --detach
  cd ..
done

echo "✅ Deploy concluído!"