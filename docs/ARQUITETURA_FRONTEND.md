# Documentação Arquitetural e Consultiva — FinCouples Frontend

> **Propósito:** Este documento serve como referência obrigatória para todas as novas funcionalidades. Antes de desenvolver qualquer feature, leia-o integralmente e siga os padrões aqui estabelecidos.

---

## Índice

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Estrutura de Pastas e Responsabilidades](#3-estrutura-de-pastas-e-responsabilidades)
4. [Padrões de Design Aplicados](#4-padrões-de-design-aplicados)
5. [Arquitetura em Camadas](#5-arquitetura-em-camadas)
6. [Componentes Cruciais e Padrões Obrigatórios](#6-componentes-cruciais-e-padrões-obrigatórios)
7. [Fluxo de Dados e Estado Global](#7-fluxo-de-dados-e-estado-global)
8. [Estilização e Tailwind CSS](#8-estilização-e-tailwind-css)
9. [Convenções e Boas Práticas](#9-convenções-e-boas-práticas)
10. [Checklist para Novas Funcionalidades](#10-checklist-para-novas-funcionalidades)

---

## 1. Visão Geral da Arquitetura

A aplicação FinCouples segue uma **arquitetura em camadas** com separação clara de responsabilidades, inspirada em princípios de **Clean Architecture** adaptados ao frontend React. A estrutura prioriza:

- **Testabilidade:** Cada camada pode ser testada isoladamente
- **Manutenibilidade:** Mudanças em uma camada afetam minimamente as demais
- **Escalabilidade:** Novos recursos seguem o mesmo padrão, facilitando onboarding

### Princípios Fundamentais

| Princípio | Aplicação no Projeto |
|-----------|----------------------|
| **Separação de responsabilidades** | Services (dados) ↔ Contexts (estado) ↔ Components (UI) |
| **Dependência unidirecional** | Dados fluem de Services → Contexts → Hooks → Components |
| **DRY (Don't Repeat Yourself)** | Utils, tipos e hooks centralizados para reutilização |
| **Single Source of Truth** | Cada entidade tem um único Context como fonte de verdade |
| **Controlled Components** | Formulários recebem callbacks e não gerenciam persistência |

---

## 2. Stack Tecnológica

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **React** | 19.x | Biblioteca UI |
| **TypeScript** | 5.9.x | Tipagem estática |
| **Vite** | 7.x | Build tool, dev server, HMR |
| **React Router** | 7.x | Roteamento SPA |
| **Tailwind CSS** | 3.4.x | Framework CSS utilitário |
| **Lucide React** | 0.562.x | Ícones SVG |
| **ESLint** | 9.x | Linting e qualidade de código |

### Por que essas escolhas?

- **React 19:** Versão estável com melhorias de concorrência e hooks
- **Vite:** Build rápido, configuração simples, suporte nativo a TypeScript
- **Tailwind:** Consistência visual, design tokens centralizados, menos CSS customizado
- **Lucide:** Ícones consistentes, tree-shakeable, tipados

---

## 3. Estrutura de Pastas e Responsabilidades

```
src/
├── assets/          # Imagens, logos, SVGs estáticos
├── components/      # Componentes UI reutilizáveis (sem lógica de negócio)
├── contexts/        # Providers e estado global (Context API)
├── data/            # Dados mock, seeds, inicialização
├── hooks/           # Custom hooks (re-exportam ou encapsulam lógica)
├── modules/         # Módulos de página/feature (lógica + UI)
├── services/        # Camada de persistência e regras de negócio
├── types/           # Interfaces e tipos TypeScript
├── utils/           # Funções utilitárias puras
├── App.tsx          # Composição de providers e rotas
├── main.tsx         # Ponto de entrada, bootstrap
└── index.css        # Tailwind + estilos globais
```

### Regras de Dependência

- **`components/`** → pode importar: `types`, `utils`, `hooks` (somente leitura)
- **`modules/`** → pode importar: `components`, `hooks`, `types`, `utils`
- **`contexts/`** → pode importar: `services`, `types`
- **`services/`** → pode importar: `types` **apenas**
- **`hooks/`** → pode importar: `contexts` (re-export) ou `utils`, `types`
- **`utils/`** → pode importar: `types` **apenas**

**Nunca:** `services` importar de `contexts` ou `modules`; `components` importar de `services` diretamente.

---

## 4. Padrões de Design Aplicados

### 4.1 Provider Pattern (Context API)

**O que é:** Padrão do React para compartilhar estado entre componentes sem prop drilling.

**Onde usamos:** `ContasContext`, `CategoriasContext`, `LancamentosContext`, `CartoesContext`, `FaturasContext`, `PrivacyContext`, `SelectedMonthContext`.

**Estrutura obrigatória:**

```tsx
// 1. Interface do valor do contexto
interface MeuContextType {
  items: MeuTipo[];
  loading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<MeuTipo, 'id'>) => Promise<void>;
  editItem: (id: string, item: Partial<MeuTipo>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
}

// 2. Criar contexto com undefined como default
const MeuContext = createContext<MeuContextType | undefined>(undefined);

// 3. Provider com useState, useEffect e chamadas ao service
export function MeuProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MeuTipo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getItems(); // service
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  return (
    <MeuContext.Provider value={{ items, loading, error, fetchItems, ... }}>
      {children}
    </MeuContext.Provider>
  );
}

// 4. Hook customizado com validação
export function useMeu() {
  const context = useContext(MeuContext);
  if (context === undefined) {
    throw new Error('useMeu deve ser usado dentro de um MeuProvider');
  }
  return context;
}
```

**Decisões técnicas:**
- `undefined` como default evita valores "falsos" que mascarem uso fora do Provider
- `throw` no hook garante que erros sejam detectados em desenvolvimento
- `loading` e `error` permitem feedback visual consistente em formulários e listas

---

### 4.2 Service Layer Pattern

**O que é:** Camada que abstrai persistência e regras de negócio. Componentes e Contexts nunca acessam `localStorage` ou API diretamente.

**Onde usamos:** `contasService`, `categoriasService`, `lancamentosService`, `cartoesService`, `faturasService`.

**Estrutura obrigatória:**

```ts
// 1. Constante de chave localStorage
const STORAGE_KEY = 'fincouples_entidade';

// 2. Funções privadas (não exportadas) para ler/escrever
function loadFromStorage(): Entidade[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: Entidade[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    console.error('Erro ao salvar no localStorage');
  }
}

// 3. Funções exportadas (API pública) - sempre async para compatibilidade futura com API
export async function getItems(): Promise<Entidade[]> { ... }
export async function createItem(item: Omit<Entidade, 'id'>): Promise<Entidade> { ... }
export async function updateItem(id: string, item: Partial<Entidade>): Promise<Entidade> { ... }
export async function deleteItem(id: string): Promise<void> { ... }
```

**Regras de negócio no Service:**
- Validações (duplicatas, regras específicas)
- Geração de IDs (`crypto.randomUUID()`)
- Tratamento de erros com `throw new Error('mensagem clara')`
- Funções auxiliares privadas (ex: `initItemsPadrao()`) quando necessário

**Exemplo de validação no Service:**

```ts
// categoriasService.ts - validação de duplicata
const duplicada = categorias.find(
  c => c.nome.toLowerCase() === categoria.nome.toLowerCase().trim() &&
       c.tipo === categoria.tipo
);
if (duplicada) {
  throw new Error('Já existe uma categoria com este nome e tipo');
}
```

---

### 4.3 Custom Hooks Pattern

**O que é:** Hooks que encapsulam acesso ao contexto ou lógica reutilizável.

**Dois tipos no projeto:**

**Tipo A — Re-export do Context (padrão atual):**
```ts
// hooks/useContas.ts
export { useContas } from '@/contexts/ContasContext';
```

**Motivo:** Permite trocar a implementação do estado (ex: de Context para Zustand) sem alterar imports nos módulos.

**Tipo B — Hook com lógica adicional:**
```ts
// Exemplo hipotético: useFormValidation, useDebounce
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => { ... }, [value, delay]);
  return debouncedValue;
}
```

**Convenção:** Sempre exportar hooks via `hooks/index.ts` e usar alias `@/hooks/useX`.

---

### 4.4 Compound Components (Card)

**O que é:** Componente que aceita slots (props como `actions`, `children`) para composição flexível.

**Exemplo — Card:**
```tsx
<Card title="Título" actions={<button>Adicionar</button>}>
  <Conteudo />
</Card>
```

- `title`: opcional
- `actions`: slot para botões/filtros no header
- `children`: conteúdo principal
- `className`: extensibilidade de estilos

---

### 4.5 Controlled Components (Formulários)

**O que é:** Formulários que recebem valor e `onChange`/`onSave` como props. O pai controla o estado e a persistência.

**Estrutura obrigatória para Form modais:**

```tsx
interface MeuFormProps {
  item?: MeuTipo | null;  // null = criação, objeto = edição
  onClose: () => void;
  onSave: (item: Omit<MeuTipo, 'id'> | MeuTipo) => Promise<void>;
}

export function MeuForm({ item, onClose, onSave }: MeuFormProps) {
  const [nome, setNome] = useState('');
  const isEditMode = !!item;

  useEffect(() => {
    if (item) { setNome(item.nome); /* ... */ }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // validações locais (obrigatoriedade, formato)
    await onSave(isEditMode && item ? { ...item, nome } : { nome, ... });
    onClose();
  };

  return ( /* modal com overlay, form, botões */ );
}
```

**Regras:**
- Form não chama service diretamente
- `onSave` é async; erros são tratados no pai (Context) ou no próprio form com `try/catch`
- Sempre `onClose` ao salvar com sucesso
- Estado local (`loading`, `error`) para feedback durante submit

---

### 4.6 List / Item Pattern

**O que é:** Lista que renderiza vários `Item` com callbacks para ações.

**Estrutura:**

```tsx
// List: recebe array, filtros e callbacks
interface ContasListProps {
  contas: Conta[];
  hidePoupancaInvestimento: boolean;
  onEdit: (conta: Conta) => void;
  onDelete: (id: string) => void;
  onToggleAtiva: (id: string) => void;
}

// Item: recebe item único e callbacks
interface ContaItemProps {
  conta: Conta;
  onEdit: (conta: Conta) => void;
  onDelete: (id: string) => void;
  onToggleAtiva: (id: string) => void;
}
```

**Benefícios:** Item testável isoladamente; List pode filtrar/ordenar sem afetar Item.

---

### 4.7 Icon Map Pattern

**O que é:** Mapeamento centralizado de nomes string para componentes de ícone (Lucide).

**Arquivo:** `src/utils/iconMap.ts`

```ts
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Wallet, ... } from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  lancamentos: Wallet,
  moradia: Home,
  alimentacao: UtensilsCrossed,
  // ...
};
```

**Uso em componentes:**
```tsx
const IconComponent = iconMap[item.iconName];
if (IconComponent) {
  return <IconComponent size={20} className="text-text-secondary" />;
}
```

**Utilitário `renderIcon`:** `utils/renderIcon.tsx` encapsula a lógica de fallback e props:
```tsx
renderIcon('moradia', { size: 20, className: 'text-positive' });
```

**Regra:** Novos ícones devem ser adicionados em `iconMap`. Categorias padrão em services usam o nome do ícone no campo `icone` (ex: `'moradia'`, `'alimentacao'`).

---

### 4.8 Empty State Pattern

**O que é:** Componente para listas vazias com mensagem e CTA.

```tsx
<EmptyState
  title="Nenhum item adicionado!"
  message="Que tal começar adicionando algo?"
  actionButton={<button onClick={onAdd}>Adicionar</button>}
  hideText={false}
/>
```

- `hideText`: útil quando o Card já tem título
- `actionButton`: CTA principal

---

## 5. Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAMADA DE UI                              │
│  modules/ (páginas)  │  components/ (Card, Sidebar, EmptyState)  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CAMADA DE ABSTRAÇÃO                          │
│  hooks/ (useContas, useCategorias, usePrivacy, ...)              │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CAMADA DE ESTADO                             │
│  contexts/ (ContasProvider, CategoriasProvider, ...)             │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CAMADA DE DADOS                              │
│  services/ (contasService, categoriasService, ...)               │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CAMADA DE PERSISTÊNCIA                       │
│  localStorage (atual) │ API REST (futuro)                        │
└─────────────────────────────────────────────────────────────────┘

  types/ e utils/ são transversais (usados em várias camadas)
```

---

## 6. Componentes Cruciais e Padrões Obrigatórios

### 6.1 App.tsx

**Responsabilidades:**
- Envolver a aplicação com `BrowserRouter`
- Compor providers na ordem correta (dependências primeiro)
- Definir layout: header, Sidebar, `<main>` com `Routes`

**Ordem dos Providers (importante para dependências):**
```tsx
<BrowserRouter>
  <PrivacyProvider>           {/* estado global de UI */}
    <SelectedMonthProvider>   {/* estado de filtro de mês */}
      <CategoriasProvider>    {/* base para lançamentos */}
        <ContasProvider>
          <CartoesProvider>
            <FaturasProvider>
              <LancamentosProvider>  {/* depende de contas, categorias, cartões */}
                <AppContent />
              </LancamentosProvider>
            </FaturasProvider>
          </CartoesProvider>
        </ContasProvider>
      </CategoriasProvider>
    </SelectedMonthProvider>
  </PrivacyProvider>
</BrowserRouter>
```

**Regra:** Providers que outros Contexts dependem devem estar "acima" na árvore.

---

### 6.2 Sidebar

**Padrões:**
- **Controlled:** Recebe `expanded`, `onMouseEnter`, `onMouseLeave`, `onClose`
- **Responsivo:** Overlay em mobile; hover em desktop
- **iconMap:** Ícones via `iconMap[nome]` para consistência
- **NavLink:** Uso de `react-router-dom` para estado ativo

**CSS complementar:** `Sidebar.css` para animações, tooltips e pseudo-elementos complexos. Tailwind para layout e cores.

---

### 6.3 Card

**Props obrigatórias:**
- `children`: conteúdo
- `title?`: título do card
- `actions?`: elementos no header (botões, filtros)
- `className?`: extensão de estilos

**Estilo:** Usar tokens do tema (`bg-surface`, `border-border`, `p-lg`, etc.).

---

### 6.4 Formulários Modais (ContaForm, CategoriaForm, CartaoForm)

**Padrão obrigatório:**
1. Overlay com `onClick` para fechar (e `stopPropagation` no conteúdo)
2. Header com título dinâmico (Novo X / Editar X) e botão fechar
3. Form com validação antes do submit
4. Exibição de `error` em caso de falha
5. Botões Cancelar e Salvar, desabilitados durante `loading`
6. Animações via `@keyframes` inline ou CSS quando necessário

---

### 6.5 Módulo Configuracoes (Tabs + CRUD)

**Estrutura padrão:**
- Estado de aba ativa (`activeTab`)
- Estados locais: `showFormX`, `itemEditando`
- Handlers: `handleAdd`, `handleEdit`, `handleSave`, `handleDelete`, `handleCloseForm`
- Renderização condicional: `{activeTab === 'x' && <Card>...</Card>}`
- Modais: `{showFormX && <XForm ... />}`

**Reutilizar esse padrão** para novas seções de configuração.

---

## 7. Fluxo de Dados e Estado Global

### Fluxo de Criação/Edição

```
Usuario clica "Adicionar"
  → setItemEditando(null); setShowForm(true)
  → Modal abre
  → Usuario preenche e submete
  → Form chama onSave(dados)
  → Configuracoes chama addItem(dados) ou editItem(id, dados)
  → Context chama service.createItem() ou service.updateItem()
  → Service persiste no localStorage
  → Context atualiza estado (setItems)
  → UI re-renderiza com novos dados
  → onClose(); setShowForm(false)
```

### Fluxo de Leitura

```
App monta
  → Providers montam
  → useEffect em cada Context chama fetchX()
  → Service.loadFromStorage() retorna dados
  → Context setState(dados)
  → Componentes que usam useX() recebem dados atualizados
```

### Bootstrap e Seed de Dados

**Onde:** `main.tsx` chama `seedAllIfEmpty()` antes de renderizar a aplicação.

**Fluxo:**
1. `initApp()` é async
2. `await seedAllIfEmpty()` popula localStorage (contas, categorias, lançamentos) se estiver vazio
3. Pequeno delay para garantir que o localStorage foi atualizado
4. `createRoot().render(<App />)`

**Arquivos:** `src/utils/seedUtils.ts` (API pública), `src/data/mockData.ts` (dados e lógica).

**Regra:** Seeds devem ser idempotentes — só populam se não houver dados. Útil para desenvolvimento e primeira execução do usuário.

---

### Estado Local vs Global

| Tipo | Onde | Exemplo |
|------|------|---------|
| **Global** | Context | contas, categorias, lançamentos, valores ocultos (privacy) |
| **Local** | useState no módulo | aba ativa, modal aberto, item sendo editado, filtros de UI |
| **Transversal** | Context | mês selecionado (SelectedMonth), privacidade (Privacy) |

**SelectedMonthContext:** Estado de filtro de mês no formato `YYYY-MM`. Usado pelo `MonthSelector` no header e por módulos como Dashboard e Lancamentos para filtrar lançamentos. Não persiste no localStorage — inicia no mês atual.

---

## 8. Estilização e Tailwind CSS

### 8.1 Design Tokens (tailwind.config.js)

**Identidade visual:** A logo (coração azul + rosa) é o elemento de marca. O header usa fundo escuro (`brandHeader`) para destacar a logo; `teal` e `pink` são usados no conteúdo (gráficos, sidebar ativo, acentos), alinhados à logo.

**Cores:**
- `brandHeader` (#1e293b) — barra superior (header); moldura escura para a logo; uso único no topo
- `teal` (#0FB9B1) — marca (gráficos, item ativo da sidebar, acentos)
- `pink` (#F78FB3) — marca (gráficos, acentos)
- `positive` (#22c55e) — valores positivos, sucesso
- `negative` (#ef4444) — valores negativos, erro
- `background`, `surface`, `border`, `text-primary`, `text-secondary`, `text-muted`

**Espaçamento:** `xs`, `sm`, `md`, `lg`, `xl`, `2xl`

**Uso:**
```tsx
className="bg-surface border border-border rounded-lg p-lg text-text-primary"
```

### 8.2 Quando Usar CSS Tradicional

- **Animações complexas:** `@keyframes` em arquivo `.css` ou `<style>` inline
- **Pseudo-elementos:** tooltips, indicadores (ex: Sidebar)
- **Scrollbar customizada:** `index.css` em `@layer base`
- **Estilos que Tailwind não cobre bem:** manter em CSS específico do componente

### 8.3 Padrão de Classes

1. Layout: `flex`, `grid`, `gap-*`, `p-*`, `m-*`
2. Cores: tokens do tema
3. Tipografia: `text-sm`, `text-base`, `font-medium`, `font-semibold`
4. Estados: `hover:`, `focus:`, `disabled:`
5. Responsivo: `md:`, `lg:` para breakpoints

---

## 9. Convenções e Boas Práticas

### 9.1 TypeScript

- **type-only imports** quando `verbatimModuleSyntax` está ativo:
  ```ts
  import type { Conta } from '@/types';
  import type { ReactNode } from 'react';
  ```
- Interfaces para props de componentes
- Evitar `any`; usar `unknown` se necessário
- Tipar retorno de funções async: `Promise<Conta>`, `Promise<void>`

### 9.2 Imports

- Usar aliases: `@/types`, `@/hooks`, `@/utils`, `@/components`, `@/modules`
- Ordem sugerida: React → libs → internos (hooks, types, components, etc.)

### 9.3 Nomenclatura

- **Componentes:** PascalCase
- **Hooks:** camelCase, prefixo `use`
- **Services:** camelCase, sufixo `Service` no arquivo
- **Contexts:** PascalCase, sufixo `Context` e `Provider`
- **Tipos/Interfaces:** PascalCase

### 9.4 Acessibilidade

- `aria-label` em botões de ícone
- `aria-hidden` em overlays decorativos
- Labels associados a inputs (`htmlFor`/`id`)

### 9.5 Tratamento de Erros

- Services: `throw new Error('mensagem clara')`
- Contexts: `try/catch`, `setError()`, `console.error()`, e opcionalmente `throw` para o chamador tratar
- Forms: exibir `error` em bloco vermelho; manter modal aberto em caso de erro

---

## 10. Checklist para Novas Funcionalidades

Antes de implementar uma nova feature, confira:

### Planejamento
- [ ] Entidade já existe em `src/types/index.ts`?
- [ ] Service correspondente necessário? (CRUD → sim)
- [ ] Context necessário? (estado compartilhado → sim)
- [ ] Hook de abstração criado e exportado em `hooks/index.ts`?

### Service
- [ ] `STORAGE_KEY` definida
- [ ] `loadFromStorage` e `saveToStorage` privadas
- [ ] Funções `get`, `create`, `update`, `delete` exportadas e async
- [ ] Validações de negócio no service
- [ ] `throw new Error` com mensagens claras

### Context
- [ ] Interface do valor do contexto definida
- [ ] `createContext` com `undefined` como default
- [ ] Provider com `loading`, `error`, `fetch` e ações CRUD
- [ ] `useEffect` para fetch inicial
- [ ] Hook `useX` com validação e `throw` se fora do Provider

### Provider na App
- [ ] Provider adicionado em `App.tsx` na ordem correta de dependências

### Módulo/Página
- [ ] Usa hooks (`useX`) em vez de acessar Context diretamente
- [ ] Estado local para modais, abas, item em edição
- [ ] Handlers para abrir/fechar form, salvar, excluir
- [ ] EmptyState quando lista vazia
- [ ] List + Item com callbacks

### Formulário
- [ ] Props: `item?`, `onClose`, `onSave`
- [ ] Modo criação vs edição via `!!item`
- [ ] Validação antes de chamar `onSave`
- [ ] Tratamento de erro e loading
- [ ] Overlay com fechar no clique

### Estilização
- [ ] Tailwind com tokens do tema
- [ ] CSS tradicional apenas quando necessário (animações, pseudo-elementos)
- [ ] Responsividade considerada

### Rotas
- [ ] Rota adicionada em `App.tsx` se for nova página
- [ ] Item na Sidebar se for navegação principal

---

## Referências Rápidas

### Path Aliases (vite.config.ts)

| Alias | Resolve para |
|-------|--------------|
| `@` | `./src` |
| `@/components` | `./src/components` |
| `@/modules` | `./src/modules` |
| `@/types` | `./src/types/index.ts` |
| `@/hooks` | `./src/hooks` |
| `@/utils` | `./src/utils` |

### Arquivos de Configuração

- `vite.config.ts` — aliases, plugins
- `tailwind.config.js` — tema, cores, espaçamentos
- `tsconfig.app.json` — compilação TypeScript do app
- `index.css` — Tailwind directives + base styles

---

*Última atualização: Fevereiro 2025*
