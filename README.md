# Golden Raspberry Awards API

API REST para consultar informações sobre os vencedores do Golden Raspberry Awards (Framboesa de Ouro), o prêmio que "homenageia" os piores filmes do ano.

## Sobre o Projeto

Este projeto foi desenvolvido como parte de um teste técnico. A API permite consultar qual produtor levou mais tempo entre dois prêmios consecutivos e qual ganhou dois prêmios mais rápido.

Os dados são carregados automaticamente de um arquivo CSV quando a aplicação inicia.

## Tecnologias Utilizadas

- **Node.js** com **TypeScript**
- **Express** - Framework web
- **SQLite** - Banco de dados em memória
- **Jest** - Testes
- **Docker** - Containerização
- **Swagger** - Documentação da API

## Arquitetura

O projeto segue os princípios SOLID e Clean Architecture, organizado em camadas:

```
outsera-test/
├── src/
│   ├── domain/              # Regras de negócio
│   ├── application/         # Casos de uso
│   ├── infrastructure/      # Banco de dados
│   └── http/                # API REST
├── tests/
│   ├── unit/                # Testes unitários
│   └── integration/         # Testes de integração
├── Movielist.csv            # Dados dos filmes
├── swagger.yaml             # Documentação da API
└── docker-compose.yml       # Configuração Docker
```

Essa estrutura facilita a manutenção e permite trocar implementações sem afetar as regras de negócio.

## Como Rodar

### Pré-requisitos

- Node.js 20 ou superior
- NPM

### Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Ou compilar e rodar em produção
npm run build
npm start
```

A API estará disponível em `http://localhost:3000`

### Com Docker

Se preferir usar Docker:

```bash
# Com Docker Compose (mais fácil)
docker-compose up -d

# Ou com Docker direto
docker build -t golden-raspberry-api .
docker run -p 3000:3000 golden-raspberry-api
```

### Documentação Interativa

Depois de iniciar o servidor, acesse:

**http://localhost:3000/api-docs**

Lá você pode ver todos os detalhes da API e até testar as requisições direto no navegador.

## Testes

O projeto tem testes unitários e de integração com boa cobertura de código.

```bash
# Rodar todos os testes
npm test

# Apenas testes unitários
npm run test:unit

# Apenas testes de integração
npm run test:integration

# Ver cobertura de código
npm run test:coverage
```

## Decisões Técnicas

### Por que Clean Architecture?
Separa as responsabilidades e torna o código mais testável. Se precisar trocar o banco de dados ou adicionar uma nova funcionalidade, fica bem mais fácil.

### Por que SQLite em memória?
Para este projeto, não precisamos persistir dados entre execuções. O SQLite em memória é rápido e não precisa de instalação externa.

### Por que Swagger?
Documentação interativa é muito melhor que um README gigante explicando cada endpoint. Você pode testar a API direto no navegador.

## Observações

- Os dados são carregados do arquivo `Movielist.csv` na inicialização
- O banco de dados é em memória, então os dados são perdidos ao reiniciar
- Produtores com nomes compostos são tratados corretamente (separados por vírgula ou "and")
- Apenas filmes marcados como vencedores (`winner = yes`) são considerados

## Desenvolvimento Assistido por IA

- Para demonstrar a capacidade na construção de prompts para IA, foi utilizado o Gemini CLI para construção da documentação via Swagger através do arquivo `task-1.md`.

**Importante:** A IA foi utilizada especificamente para a implementação da documentação Swagger (conforme `task-1.md`). O restante do projeto foi desenvolvido manualmente.

**Escopo de uso da IA:**
- Geração da documentação OpenAPI/Swagger
- Criação dos schemas e exemplos de resposta
- Integração do Swagger UI na aplicação

**Resultado:** `swagger.yaml` completo com schemas, validações e Swagger UI funcional em `/api-docs`.

---

Desenvolvido por Leonardo Furtado como parte de um teste técnico para a Outsera.
