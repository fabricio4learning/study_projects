-- Script de inicialização do Cassandra para URL Shortener
-- Executado automaticamente no primeiro startup do container
-- 
-- Nota: Este script cria apenas o keyspace. 
-- O schema das tabelas é versionado separadamente em /schema/ (ver US-03)

-- Criar keyspace com estratégia de replicação simples (1 nó para desenvolvimento)
CREATE KEYSPACE IF NOT EXISTS url_shortener 
WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 1
} AND durable_writes = true;

-- Opcional: confirmar criação
-- DESCRIBE KEYSPACE url_shortener;