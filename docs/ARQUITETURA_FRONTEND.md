# Arquitetura do frontend — Nós

> Documento de referência para manutenção e desenvolvimento. Atualizado em agosto de 2026 a partir da implementação atual.

## 1. Visão geral

O Nós é uma SPA React para gestão financeira de casais. A aplicação usa uma arquitetura em camadas e pode operar sobre `localStorage` ou Supabase sem que páginas e componentes conheçam a persistência escolhida.

```text
modules/components → hooks → contexts → services → DataSource → mock ou Supabase
```

`getDataSource()`, em `src/data/config.ts`, seleciona:

- `mockDataSource` quando `VITE_USE_API` não é `true` ou faltam credenciais;
- `supabaseDataSource` quando a API está habilitada e configurada.

## 2. Stack atual

| Tecnologia | Responsabilidade |
|---|---|
| React 19 | Interface e estado |
| TypeScript 5.9 | Tipagem do domínio e contratos |
| Vite 7 | Desenvolvimento e build |
| React Router 7 | Rotas da SPA |
| Context API | Estado global por entidade |
| Supabase JS | Autenticação, banco e RPCs |
| ApexCharts | Gráficos |
| Tailwind CSS e CSS Modules | Estilização |
| Lucide React | Ícones |

## 3. Estrutura e responsabilidades

```text
src/
├── assets/       arquivos estáticos
├── components/   componentes reutilizáveis e shell
├── contexts/     estado global e coordenação das operações
├── data/
│   ├── contracts.ts       interfaces dos repositórios
│   ├── config.ts          seleção da fonte de dados
│   └── sources/
│       ├── mock/          persistência em localStorage
│       └── supabase/      autenticação e persistência remota
├── hooks/        API de acesso aos contexts
├── modules/      páginas e funcionalidades
├── services/     fachada de dados e regras de negócio
├── types/        entidades compartilhadas
├── utils/        formatação, seed e migrações
├── App.tsx       providers, autenticação e rotas
└── main.tsx      bootstrap e seed do modo mock
```

A interface usa hooks e contexts; contexts usam services; services usam os contratos de dados. Módulos não devem acessar Supabase ou `localStorage` diretamente.

Exceções deliberadas são os contexts de preferências locais (`ThemeContext` e `PrivacyContext`) e o `CasalContext`, que coordena a identidade conforme o modo ativo.

## 4. Modelo de domínio

As entidades centrais estão em `src/types/index.ts`:

- `Casal`: vínculo entre os dois usuários;
- `Conta`: conta corrente, poupança ou investimento;
- `CartaoCredito`: limite, fatura, fechamento e vencimento;
- `Categoria`: classificação de receita ou despesa;
- `Lancamento`: movimentação, conta ou cartão, pessoa, pagamento e parcelamento;
- `FaturaCartao`: total, valor pago, período e status;
- `MetaFinanceira`: objetivo, progresso, prazo e mês de referência.

Dados financeiros compartilhados carregam `casalId`. Atribuições pessoais usam `usuario1` e `usuario2`; no Supabase, `getCasalSession()` converte o usuário autenticado para um desses papéis.

## 5. Persistência

### Contratos

`src/data/contracts.ts` define operações para contas, cartões, categorias, lançamentos, faturas, metas e casal. Services e contexts dependem dessas interfaces.

Para adicionar uma entidade persistida:

1. criar o tipo de domínio;
2. adicionar o contrato ao `DataSource`;
3. implementar os repositórios mock e Supabase;
4. registrar ambos nos respectivos `index.ts`;
5. expor operações por service e context.

### Modo mock

Os repositórios de `src/data/sources/mock` persistem JSON no `localStorage`. Datas são serializadas em ISO e reconstruídas como `Date`. O bootstrap executa `seedAllIfEmpty()` somente nesse modo.

Não há autenticação real: a pessoa atual é `usuario1` e o parceiro é considerado presente.

### Modo Supabase

Os repositórios de `src/data/sources/supabase` convertem o modelo TypeScript em camelCase para colunas snake_case.

`getCasalSession()` resolve e mantém em cache usuário, casal, papel da pessoa, nomes e presença do parceiro. Nos inserts, os repositórios obtêm `casalId` e identidade da sessão, evitando confiar nesses campos enviados pela interface. O banco deve complementar essa proteção com Row Level Security.

## 6. Autenticação e onboarding

`AuthGate` só bloqueia a aplicação no modo Supabase:

```text
sem sessão → Auth
sessão sem perfil → Onboarding
perfil e casal válidos → aplicação
```

O onboarding permite criar um casal ou aceitar um convite por funções RPC do Supabase. Em modo mock, o gate libera a aplicação diretamente.

## 7. Estado e fluxo de operações

Cada domínio tem um Provider que carrega dados, expõe `loading` e `error` e coordena criação, edição e remoção.

```text
Formulário → página → Context → Service → repositório
                                  ↓
                    atualização do Context → UI
```

Os hooks em `src/hooks` são a API preferida para módulos. `SelectedMonthContext` mantém o mês global em `YYYY-MM`; tema e preferências de privacidade persistem localmente.

## 8. Providers e rotas

`App.tsx` mantém providers de dados dentro de `AuthGate`, garantindo que consultas remotas ocorram após autenticação e onboarding.

| Rota | Módulo |
|---|---|
| `/home` | Dashboard |
| `/lancamentos` | Lançamentos |
| `/relatorios` | Relatórios |
| `/metas` | Metas |
| `/contas` | Contas |
| `/cartoes` | Cartões e faturas |
| `/configuracoes` | Casal, contas, cartões e categorias |

`/` redireciona para `/home`.

## 9. Padrões de interface

- Formulários recebem callbacks assíncronos e não acessam repositórios.
- Lists cuidam de coleção; Items apresentam uma entidade.
- Card, EmptyState, diálogos, toasts e shell devem ser reutilizados.
- Ícones persistidos como texto são resolvidos pelo mapa central.
- CSS Modules atende estilos específicos; tokens globais e Tailwind atendem padrões compartilhados.
- Toda operação assíncrona deve tratar carregamento, erro e estado vazio.

## 10. Regras financeiras existentes

- totais mensais de receita, despesa e resultado;
- saldo disponível acumulado por mês;
- agrupamentos por categoria, pessoa e pagamento;
- lançamentos parcelados;
- geração de faturas pelo período de fechamento;
- pagamento parcial ou total;
- limite utilizado e disponível;
- progresso de metas;
- alertas de vencimento e saldo.

Alterações nessas regras devem ser validadas nos modos mock e Supabase.

## 11. Checklist para novas funcionalidades

- [ ] Tipo de domínio sem dependência de UI.
- [ ] Contrato e implementações mock/Supabase equivalentes.
- [ ] Mapeamento de datas e colunas revisado.
- [ ] Regra independente da UI mantida no service.
- [ ] Context expõe dados, loading, error e operações.
- [ ] Hook usado pelos módulos.
- [ ] Provider depende de sessão? Posicioná-lo após `AuthGate`.
- [ ] Estados vazio, carregando, sucesso e erro tratados.
- [ ] Acessibilidade considerada.
- [ ] `npm run build` e `npm run lint` executados.
- [ ] Isolamento por casal e políticas RLS revisados.

## 12. Limitações conhecidas

- Não há suíte de testes automatizados configurada.
- O lint possui pendências em hooks, Fast Refresh e variáveis não utilizadas.
- Schema, RPCs e políticas Supabase ainda não estão versionados no repositório.
- Existe um Dashboard legado em `src/modules/Dashboard/legacy`.
- Não há sincronização em tempo real entre as sessões do casal.
