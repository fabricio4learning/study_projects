# Encurtador de URLs

Projeto de encurtamento de URLs construído com NestJS, Fastify, Cassandra e Redis.

Este documento descreve como preparar e iniciar o ambiente local referente às **US-01 — Setup do projeto NestJS com adapter Fastify** e **US-02 — Ambiente Docker Compose com Cassandra e Redis**.

## Pré-requisitos

Instale previamente:

- Node.js compatível com a versão definida no projeto.
- npm.
- Docker Engine ou Docker Desktop.
- Docker Compose v2, disponibilizado pelo comando `docker compose`.

Valide as instalações:

```bash
node --version
npm --version
docker --version
docker compose version
```

## Estrutura esperada

Os arquivos relacionados ao ambiente local devem estar organizados aproximadamente assim:

```text
.
├── docker-compose.yml
├── docker/
│   └── cassandra/
│       └── init.cql
├── package.json
├── src/
├── test/
└── README.md
```

O `init.cql` deve conter somente o bootstrap de infraestrutura do Cassandra, como a criação do keyspace. A criação e a evolução das tabelas pertencem ao schema versionado da US-03.

## US-01 — Aplicação NestJS

A US-01 estabelece a base da aplicação com NestJS e `FastifyAdapter`. Ela inclui o bootstrap da aplicação, o endpoint `GET /health`, a estrutura inicial de módulos, ESLint, Prettier e o teste E2E básico do health check.

### Instalar dependências

Na raiz do projeto, execute:

```bash
npm install
```

### Iniciar em desenvolvimento

```bash
npm run start:dev
```

Por padrão, a aplicação deve iniciar na porta configurada pelo projeto. Caso exista suporte à variável `PORT`, ela pode ser informada assim:

```bash
PORT=3000 npm run start:dev
```

Em outro terminal, valide o health check:

```bash
curl -i http://localhost:3000/health
```

O resultado esperado é HTTP `200` com o payload definido pela implementação do projeto.

### Executar validações

```bash
npm run lint
npm run format
npm run test:e2e
```

Se o script `format` não existir no `package.json`, use o comando equivalente configurado no projeto, por exemplo:

```bash
npx prettier --write .
```

## US-02 — Cassandra e Redis

A US-02 disponibiliza Cassandra e Redis localmente via Docker Compose, com portas expostas, volumes persistentes, keyspace inicializado no Cassandra e persistência habilitada no Redis para preservar o contador usado por `INCR` após reinicializações. Esses requisitos estão registrados na história FAB-10 do Linear. [cite:linear_native:2]

### Subir os serviços

Na raiz do projeto, execute:

```bash
docker compose up -d
```

#### Primeiro Setup

Após `docker-compose up -d`, executar uma vez:

```bash
docker-compose exec cassandra cqlsh -e "CREATE KEYSPACE IF NOT EXISTS url_shortener WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};"
```

Para acompanhar os logs:

```bash
docker compose logs -f
```

Verifique o estado dos containers:

```bash
docker compose ps
```

Aguarde os serviços ficarem prontos antes de iniciar testes que dependam deles. O primeiro boot do Cassandra pode levar alguns minutos.

### Validar Cassandra

Confirme que o container está em execução:

```bash
docker compose ps cassandra
```

Abra o cliente CQL dentro do container:

```bash
docker compose exec cassandra cqlsh
```

No prompt do Cassandra, valide o keyspace:

```sql
DESCRIBE KEYSPACES;
```

Saia com:

```sql
EXIT;
```

O schema das tabelas não deve ser criado pelo bootstrap da US-02. Ele deverá ser aplicado pelo mecanismo de schema versionado definido na US-03.

### Validar Redis

Verifique a conectividade:

```bash
docker compose exec redis redis-cli PING
```

A resposta esperada é:

```text
PONG
```

Valide a persistência do contador com uma chave de teste:

```bash
docker compose exec redis redis-cli INCR url_counter
```

Reinicie somente o Redis:

```bash
docker compose restart redis
```

Leia o valor novamente:

```bash
docker compose exec redis redis-cli GET url_counter
```

O valor deve continuar disponível após o restart, porque o serviço está configurado com persistência. Se a chave já tiver sido utilizada anteriormente, o número retornado será maior que `1`.

## Fluxo completo de inicialização

Para iniciar o ambiente local do zero, use:

```bash
npm install
docker compose up -d
docker compose ps
npm run start:dev
```

Em outro terminal:

```bash
curl -i http://localhost:3000/health
docker compose exec cassandra cqlsh -e "DESCRIBE KEYSPACES;"
docker compose exec redis redis-cli PING
```

A aplicação NestJS deve responder ao health check e os dois serviços devem estar acessíveis pelos hostnames e portas definidos no `docker-compose.yml`.

## Parar o ambiente

Para parar os containers sem remover os dados persistidos:

```bash
docker compose down
```

Para parar e remover também os volumes, recriando o ambiente na próxima subida:

```bash
docker compose down -v
```

> Atenção: `docker compose down -v` remove os dados persistidos do Cassandra e do Redis. Use esse comando somente quando quiser resetar o ambiente local.

## Solução de problemas

### Porta já está em uso

Identifique o processo que ocupa a porta ou altere o mapeamento no `docker-compose.yml`. As portas normalmente utilizadas são:

- Aplicação NestJS: `3000`.
- Cassandra: `9042`.
- Redis: `6379`.

### Cassandra ainda não responde

Aguarde a conclusão da inicialização e consulte os logs:

```bash
docker compose logs -f cassandra
```

### Redis não responde

Consulte os logs e confirme o status do container:

```bash
docker compose logs redis
docker compose ps redis
```

### Reset completo

Se o ambiente estiver inconsistente, remova containers e volumes e suba novamente:

```bash
docker compose down -v
docker compose up -d
```

## Escopo das histórias

- **US-01:** base NestJS com Fastify, health check, qualidade de código e teste E2E.
- **US-02:** ambiente local com Cassandra e Redis via Docker Compose, bootstrap do keyspace e persistência dos dados.
- **US-03:** schema versionado das tabelas do Cassandra, fora do bootstrap da US-02.
