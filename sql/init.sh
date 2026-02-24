#!/bin/bash
set -e

echo "🔧 Inicializando banco de dados Biblioteca Online..."

# Executar script SQL principal
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    $(cat /docker-entrypoint-initdb.d/biblioteca.sql)
EOSQL

echo "✅ Banco inicializado com sucesso!"