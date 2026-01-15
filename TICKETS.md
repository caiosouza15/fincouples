# Tickets de Funcionalidades

## TICKET-001: Gestão de Contas Financeiras

### 📋 Descrição
Implementar funcionalidade completa de gerenciamento de contas financeiras, permitindo ao casal cadastrar, editar, visualizar e gerenciar múltiplas contas (corrente, poupança, investimento).

### 🎯 Objetivo
Criar a base de dados financeiros do casal, permitindo que eles registrem todas as suas contas bancárias e acompanhem os saldos de forma consolidada. Esta funcionalidade é fundamental para o cálculo do saldo geral e será base para outras features como lançamentos.

### ✨ Funcionalidades a Implementar

#### 1. Gerenciamento de Estado
- [ ] Criar Context API para gerenciar estado das contas
- [ ] Implementar hook `useContas` para acesso simplificado
- [ ] Persistência local com localStorage
- [ ] Funções utilitárias para storage (salvar/carregar)

#### 2. CRUD de Contas
- [ ] **Listar contas**: Exibir todas as contas do casal no card "Minhas contas"
- [ ] **Criar conta**: Formulário modal/sidebar com campos:
  - Nome da conta (ex: "NuConta", "Banco do Brasil")
  - Tipo (corrente, poupança, investimento)
  - Saldo inicial
  - Ícone/logo (opcional, para futuro)
- [ ] **Editar conta**: Permitir alterar nome, tipo e saldo
- [ ] **Excluir conta**: Com modal de confirmação
- [ ] **Toggle ativa/inativa**: Desativar conta sem excluir

#### 3. Interface do Dashboard
- [ ] Atualizar card "Minhas contas" com lista real de contas
- [ ] Exibir saldo individual por conta
- [ ] Calcular e exibir saldo geral consolidado
- [ ] Implementar checkbox "Esconder saldo das contas poupanças/investimentos"
- [ ] Botão "Adicionar conta" funcional
- [ ] Empty state quando não houver contas

#### 4. Validações
- [ ] Nome da conta obrigatório
- [ ] Tipo obrigatório
- [ ] Saldo inicial numérico válido
- [ ] Prevenir contas duplicadas (mesmo nome + tipo)
- [ ] Mensagens de erro amigáveis

#### 5. UX/UI
- [ ] Modal/sidebar para formulário de conta
- [ ] Feedback visual ao salvar (loading, sucesso)
- [ ] Animações suaves de transição
- [ ] Responsividade mobile-first
- [ ] Acessibilidade (ARIA labels, navegação por teclado)

### 📁 Estrutura de Arquivos a Criar

```
src/
├── contexts/
│   └── ContasContext.tsx          # Context API para contas
├── hooks/
│   └── useContas.ts                # Hook customizado
├── modules/
│   └── Configuracoes/
│       └── Contas/
│           ├── ContasList.tsx      # Lista de contas
│           ├── ContaForm.tsx       # Formulário criar/editar
│           ├── ContaItem.tsx       # Item individual da lista
│           └── Contas.module.css   # Estilos do módulo
└── utils/
    ├── storage.ts                  # Funções localStorage
    └── formatCurrency.ts           # Formatação de moeda
```

### 🔄 Fluxo de Dados

```
ContasContext (estado global)
    ↓
useContas (hook)
    ↓
ContasList → ContaItem → ContaForm
    ↓
localStorage (persistência)
```

### 📊 Dados Esperados

#### Estrutura de uma Conta:
```typescript
{
  id: string (UUID)
  casalId: string (por enquanto fixo, depois será dinâmico)
  nome: string (ex: "NuConta")
  tipo: 'corrente' | 'poupanca' | 'investimento'
  saldo: number (ex: 1212.92)
  ativa: boolean
  icone?: string (opcional, para futuro)
}
```

### 🎨 Design Esperado

- Card "Minhas contas" no Dashboard exibindo lista de contas
- Cada conta mostra: ícone/logo, nome, tipo, saldo formatado
- Botão de editar/excluir em cada item
- Modal/sidebar com formulário limpo e intuitivo
- Cores funcionais: verde para saldo positivo, vermelho para negativo

### ✅ Critérios de Aceite

- [ ] Usuário consegue cadastrar uma nova conta
- [ ] Usuário consegue editar uma conta existente
- [ ] Usuário consegue excluir uma conta (com confirmação)
- [ ] Saldo geral é calculado corretamente (soma de todas as contas ativas)
- [ ] Checkbox de ocultar saldos funciona corretamente
- [ ] Dados persistem após recarregar a página
- [ ] Interface é responsiva e funciona bem no mobile
- [ ] Validações impedem dados inválidos
- [ ] Empty state é exibido quando não há contas

### 🔗 Dependências

- Nenhuma (esta é a primeira funcionalidade)
- Será base para: Lançamentos, Dashboard dinâmico, Cartões

### 📝 Notas Técnicas

- Usar Context API (não Redux/Zustand por enquanto, para manter simples)
- localStorage para persistência (futuramente migrar para backend)
- IDs usando `crypto.randomUUID()` ou biblioteca como `uuid`
- Formatação de moeda: `toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })`
- Validação de formulário pode usar HTML5 nativo ou biblioteca leve

### 🚀 Próximos Passos Após Conclusão

1. Implementar Categorias
2. Implementar Lançamentos (que usarão as contas)
3. Atualizar Dashboard com cálculos reais

---

**Prioridade**: Alta  
**Estimativa**: 4-6 horas  
**Tipo**: Feature  
**Módulo**: Configurações / Dashboard  
**Status**: 🟡 Em Desenvolvimento
