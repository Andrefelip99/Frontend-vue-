# Frontend Micro-Federação

Frontend Vue.js para aplicação micro-federada.

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run serve
```

A aplicação estará disponível em `http://localhost:8080`

## Build

```bash
npm run build
```

O output será gerado em `dist/`

## Deploy no Vercel

O projeto está configurado para fazer deploy automático no Vercel. As configurações estão em `vercel.json` e `.vercelignore`.

### Configurações:
- **Framework**: Vue 3
- **Output Directory**: `frontend/dist`
- **Build Command**: `npm run build`

## Problemas Comuns

### Erro de Permissão no Vercel

Se receber erro `Permission denied` no `vue-cli-service`, certifique-se que:

1. O `package-lock.json` está commitado
2. As dependências estão listadas corretamente no `package.json`
3. O `vercel.json` está configurado corretamente

## Scripts Disponíveis

- `npm run serve` - Inicia servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run lint` - Lint do código com ESLint

## Vulnerabilidades Conhecidas

O projeto possui 15 vulnerabilidades transitividades no Vue CLI 5 que não afetam o build ou runtime. Para atualizar para versões mais recentes do Vue CLI, será necessário refazer o projeto com Vue CLI 6+.

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── App.vue          # Componente raiz
│   ├── main.js          # Ponto de entrada
│   ├── router.js        # Configuração de rotas
│   ├── components/      # Componentes reutilizáveis
│   ├── services/        # Serviços (API, etc)
├── public/              # Arquivos estáticos
├── babel.config.js      # Configuração Babel
├── vue.config.js        # Configuração Vue CLI
└── package.json         # Dependências e scripts
```

## Suporte

Para reportar problemas, abra uma issue no repositório.
