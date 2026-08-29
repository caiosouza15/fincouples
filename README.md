# Nós

Aplicação web de organização financeira compartilhada para casais. O projeto reúne contas, cartões, lançamentos, faturas, metas e relatórios em uma visão conjunta, sem perder a identificação de quem realizou cada movimentação.

## Estado atual

O projeto funciona em dois modos de persistência:

- **Mock local:** usa `localStorage`, não exige autenticação e cria dados iniciais para desenvolvimento.
- **Supabase:** usa autenticação, banco de dados e vínculo do casal por convite.

A fonte de dados é escolhida em tempo de execução por `src/data/config.ts`, sem alterar os componentes da interface.

### Funcionalidades implementadas

- autenticação por e-mail e senha no modo Supabase;
- criação do casal e entrada do parceiro por convite;
- contas bancárias e saldo consolidado;
- receitas e despesas, inclusive parceladas;
- categorias padrão e personalizadas;
- cartões de crédito, limites e faturas;
- metas financeiras;
- dashboard mensal com visão do casal ou de cada pessoa;
- relatórios por período, categoria, forma de pagamento, cartão e pessoa;
- alertas de vencimento e saldo;
- privacidade de valores e temas claro/escuro.

## Tecnologias

- React 19 e TypeScript;
- Vite;
- React Router;
- Supabase;
- ApexCharts;
- Tailwind CSS, CSS Modules e Lucide React.

## Início rápido

```bash
npm install
copy .env.example .env
npm run dev
```

Por padrão, `.env.example` inicia o projeto em modo mock:

```env
VITE_USE_API=false
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Para usar o Supabase, informe a URL e a chave anônima do projeto e altere `VITE_USE_API` para `true`. O banco precisa possuir o schema, as políticas de acesso e as funções RPC esperadas pelo frontend.

## Comandos

```bash
npm run dev       # servidor de desenvolvimento
npm run build     # verificação TypeScript e build de produção
npm run lint      # análise estática
npm run preview   # prévia do build
```

## Documentação

- [Arquitetura do frontend](docs/ARQUITETURA_FRONTEND.md)
- [Estado funcional e roadmap](docs/DEPENDENCIAS.md)
