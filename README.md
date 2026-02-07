# Calculadora de Gastos

Aplicativo para controle financeiro pessoal com foco em clareza, organização e tomada de decisão consciente.

## 🎯 Sobre o Projeto

O **Calculadora de Gastos** oferece uma visão clara, simples e confiável da vida financeira do usuário, transformando dados financeiros em informações compreensíveis.

### Características

- **Interface clara e organizada**: Design baseado em cards com hierarquia visual forte
- **Mobile-first**: Experiência otimizada para dispositivos móveis
- **Modular e escalável**: Arquitetura pensada para facilitar manutenção e evolução
- **TypeScript**: Tipagem estática para maior confiabilidade

## 📐 Arquitetura

> **📖 Documentação completa:** Consulte [`docs/ARQUITETURA_FRONTEND.md`](docs/ARQUITETURA_FRONTEND.md) para padrões arquiteturais, design patterns, convenções e checklist de novas funcionalidades.

### Módulos Principais

- **Dashboard**: Visão geral e resumo financeiro imediato
- **Lançamentos**: Registro e consulta de receitas e despesas
- **Relatórios**: Análise gráfica e comparativa de dados
- **Metas**: Planejamento e acompanhamento financeiro
- **Configurações**: Personalização e gestão de dados

### Estrutura de Pastas

```
src/
├── components/     # Componentes reutilizáveis
├── modules/        # Módulos funcionais (Dashboard, Lançamentos, etc)
├── types/          # Definições de tipos TypeScript
├── hooks/          # Hooks customizados
├── utils/          # Funções utilitárias
└── ...
```

### Entidades Principais

- Usuário
- Conta (corrente, poupança, investimento)
- Cartão de crédito
- Lançamento (receita/despesa)
- Categoria
- Meta financeira

## 🚀 Tecnologias

- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS 3.4** - Framework CSS utilitário
- **PostCSS** - Processamento CSS
- **ESLint** - Linting

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Linting
npm run lint
```

## 🎨 Diretrizes de Design

### Cores Funcionais
- **Verde** (`#22c55e`): Valores positivos (receitas, saldo positivo)
- **Vermelho** (`#ef4444`): Valores negativos (despesas, saldo negativo)

### Princípios de UX
- Uma informação principal por card
- Números mais visíveis que textos
- Ações sempre próximas do contexto
- Linguagem simples e direta

## 🎨 Tailwind CSS

O projeto utiliza **Tailwind CSS 3.4** para estilização. O tema foi customizado para manter a identidade visual do projeto.

### Tema Customizado

As cores, espaçamentos e outros tokens de design estão configurados em `tailwind.config.js`:

**Cores:**
- `positive` - Verde para valores positivos
- `negative` - Vermelho para valores negativos
- `background` - Cor de fundo
- `surface` - Cor de superfície (cards)
- `border` - Cor de borda
- `text-primary` - Texto principal
- `text-secondary` - Texto secundário
- `text-muted` - Texto desativado

**Espaçamentos:**
- `xs`, `sm`, `md`, `lg`, `xl`, `2xl` - Escala de espaçamento personalizada

**Exemplo de uso:**
```tsx
<div className="bg-surface border border-border rounded-lg p-lg">
  <h2 className="text-xl font-semibold text-text-primary">Título</h2>
  <p className="text-text-secondary">Conteúdo</p>
</div>
```

### Estrutura CSS

- `src/index.css` - Contém as diretivas Tailwind e estilos globais
- Componentes utilizam classes Tailwind inline
- Estilos complexos (animações, tooltips) podem usar CSS tradicional quando necessário

## 📝 Path Aliases

O projeto utiliza aliases para facilitar imports:

```typescript
import { Dashboard } from '@/modules/Dashboard';
import { Card } from '@/components/Card';
import { Usuario } from '@/types';
```

Aliases disponíveis:
- `@/*` → `./src/*`
- `@/components/*` → `./src/components/*`
- `@/modules/*` → `./src/modules/*`
- `@/types/*` → `./src/types/*`
- `@/hooks/*` → `./src/hooks/*`
- `@/utils/*` → `./src/utils/*`

## 📄 Licença

Este projeto é privado.
