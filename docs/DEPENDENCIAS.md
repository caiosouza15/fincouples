# Dependências e Funcionalidades Futuras

> 📅 **Data de Criação**: 2024  
> 📋 **Propósito**: Documento de referência para funcionalidades futuras, inspiradas em análises de concorrentes e melhores práticas do mercado.

---

## 📊 Análise Comparativa: Meu Planner Financeiro

### ✅ Funcionalidades Já Planejadas/Implementadas no FinCouples

1. **Gestão de Contas Bancárias** ✅ (TICKET-001 em andamento)
   - CRUD completo de contas
   - Tipos: corrente, poupança, investimento
   - Cálculo de saldo consolidado

2. **Lançamentos (Receitas/Despesas)** ✅ (Planejado)
   - Registro de receitas e despesas
   - Categorias personalizáveis
   - Vinculação a contas/cartões

3. **Cartões de Crédito** ✅ (Tipo já definido)
   - Gestão de múltiplos cartões
   - Controle de faturas e limites
   - Dias de fechamento e vencimento

4. **Metas Financeiras** ✅ (Planejado)
   - Criação de metas
   - Acompanhamento de progresso
   - Por categoria ou valor total

5. **Relatórios e Dashboards** ✅ (Planejado)
   - Análise gráfica
   - Visão geral financeira
   - Maiores gastos

---

## 🆕 Funcionalidades do Meu Planner para Incorporar

### 1. ⭐ Categorização Automática com IA
**Prioridade**: Alta  
**Complexidade**: Média-Alta  
**Impacto**: Alto

#### Descrição
- Categorização automática de lançamentos baseada na descrição
- Aprendizado com histórico do usuário
- Correção manual e refinamento

#### Como Implementar
1. **Versão 1 (Simples)**:
   - Dicionário de palavras-chave por categoria
   - Regras configuráveis pelo usuário
   - Padrões de reconhecimento básicos

2. **Versão 2 (Avançada)**:
   - Integração com API de IA (OpenAI, Google)
   - Machine learning local (TensorFlow.js)
   - Sugestões inteligentes baseadas em histórico

#### Benefícios
- ✅ Economia massiva de tempo
- ✅ Consistência na categorização
- ✅ Diferencial competitivo
- ✅ Melhora a experiência do usuário

#### Dependências
- Sistema de categorias implementado
- Sistema de lançamentos implementado
- (Opcional) API de IA ou biblioteca de ML

---

### 2. ⭐ Importação de Extratos Bancários
**Prioridade**: Alta  
**Complexidade**: Média  
**Impacto**: Muito Alto

#### Descrição
- Upload de arquivos OFX, XLS, PDF
- Importação automática de transações
- Reconciliação com lançamentos existentes

#### Como Implementar

**Fase 1: OFX (Mais Simples)**
- Formato padrão bancário estruturado
- Parser para extrair transações
- Mapeamento de campos (data, valor, descrição)
- Interface de upload e preview

**Fase 2: XLS/CSV**
- Leitura de planilhas Excel
- Detecção automática de colunas
- Wizard de mapeamento manual

**Fase 3: PDF**
- OCR para extrair dados (mais complexo)
- Análise de layout de extratos
- Pode requerer biblioteca especializada

#### Benefícios
- ✅ Elimina entrada manual massiva
- ✅ Reduz erros humanos
- ✅ Atrai usuários de planilhas Excel
- ✅ Facilita migração de outros sistemas

#### Dependências
- Sistema de lançamentos implementado
- Sistema de contas implementado
- Biblioteca para parsing (ex: `ofx-parser`, `xlsx`)

#### Tecnologias Sugeridas
- `ofx-parser` - Para arquivos OFX
- `xlsx` ou `exceljs` - Para arquivos Excel
- `pdf-parse` ou `pdf.js` - Para PDFs (mais complexo)

---

### 3. ⭐ Planejamento Orçamentário Mensal
**Prioridade**: Alta  
**Complexidade**: Média  
**Impacto**: Alto

#### Descrição
- Criar orçamento fixo e variável por categoria
- Comparação visual: planejado vs realizado
- Alertas quando próximo ou acima do limite
- Gráficos de acompanhamento

#### Como Implementar

**Estrutura de Dados**:
```typescript
interface Orcamento {
  id: string;
  casalId: string;
  categoriaId: string;
  mesReferencia: string; // "2024-11"
  valorPlanejado: number;
  valorRealizado: number; // Calculado
  tipo: 'fixo' | 'variavel';
}
```

**Funcionalidades**:
1. Interface de criação/edição de orçamento
2. Cálculo automático do realizado (soma de lançamentos)
3. Dashboard com comparação visual
4. Alertas (barra de progresso, cores)
5. Histórico mensal

#### Benefícios
- ✅ Controle proativo de gastos
- ✅ Prevenção de gastos excessivos
- ✅ Educação financeira
- ✅ Planejamento mais efetivo

#### Dependências
- Sistema de categorias implementado
- Sistema de lançamentos implementado
- Dashboard com cálculos dinâmicos

---

### 4. 📈 Projeção de Fluxo de Caixa
**Prioridade**: Média  
**Complexidade**: Média  
**Impacto**: Médio-Alto

#### Descrição
- Visualizar saldo projetado para próximos meses
- Baseado em receitas fixas e despesas previstas
- Alertas de saldo negativo futuro
- Gráfico temporal interativo

#### Como Implementar

**Cálculos Necessários**:
- Receitas recorrentes (fixas)
- Despesas recorrentes (fixas)
- Despesas previstas (parcelas, compromissos)
- Saldo inicial (saldo atual)
- Projeção mês a mês

**Interface**:
- Gráfico de linha temporal (próximos 6-12 meses)
- Cores: verde (positivo), vermelho (negativo)
- Tooltips com detalhes mensais
- Filtros por conta ou consolidado

#### Benefícios
- ✅ Planejamento antecipado
- ✅ Prevenção de problemas financeiros
- ✅ Decisões mais informadas
- ✅ Visualização clara do futuro

#### Dependências
- Sistema de lançamentos com recorrência
- Sistema de contas implementado
- Biblioteca de gráficos (ex: `recharts`, `chart.js`)

---

### 5. 💼 Gestão de Patrimônio
**Prioridade**: Média  
**Complexidade**: Média  
**Impacto**: Médio

#### Descrição
- Registro de ativos (investimentos, imóveis, veículos)
- Acompanhamento de evolução patrimonial ao longo do tempo
- Gráficos de distribuição de patrimônio
- Valoração atualizada

#### Como Implementar

**Estrutura de Dados**:
```typescript
interface Ativo {
  id: string;
  casalId: string;
  tipo: 'investimento' | 'imovel' | 'veiculo' | 'outros';
  nome: string;
  valorAtual: number;
  valorInicial?: number;
  dataAquisicao?: Date;
  historicoValores?: Array<{ data: Date; valor: number }>;
}
```

**Funcionalidades**:
- CRUD de ativos
- Histórico de valoração
- Gráfico de evolução patrimonial
- Distribuição por tipo de ativo

#### Benefícios
- ✅ Visão completa da situação financeira
- ✅ Acompanhamento de crescimento patrimonial
- ✅ Planejamento de longo prazo

#### Dependências
- Dashboard com gráficos
- Sistema de persistência

---

### 6. 📋 Planos Individuais com Parcelamento Automático
**Prioridade**: Média  
**Complexidade**: Média-Baixa  
**Impacto**: Médio

#### Descrição
- Criar planos de gasto ou objetivo com parcelamento
- Distribuição automática de mensalidades ao longo do tempo
- Acompanhamento de progresso

#### Exemplo de Uso
- Plano: "Viagem para Europa - R$ 12.000"
- Prazo: 12 meses
- Distribuição automática: R$ 1.000/mês
- Dashboard mostra progresso

#### Como Implementar

**Estrutura de Dados**:
```typescript
interface Plano {
  id: string;
  casalId: string;
  titulo: string;
  valorTotal: number;
  prazo: number; // meses
  valorMensal: number; // calculado
  valorAtual: number; // acumulado
  dataInicio: Date;
  dataFim: Date;
  concluido: boolean;
}
```

#### Benefícios
- ✅ Planejamento de longo prazo
- ✅ Organização de grandes despesas
- ✅ Visualização clara de objetivos

#### Dependências
- Sistema de metas (pode ser extensão)
- Dashboard

---

### 7. 📊 Indicadores do Banco Central
**Prioridade**: Baixa  
**Complexidade**: Baixa-Média  
**Impacto**: Baixo-Médio

#### Descrição
- Exibir indicadores econômicos atualizados
- Taxa Selic, Inflação (IPCA), CDI
- Integração com API do Banco Central

#### Como Implementar
- API pública do Banco Central do Brasil
- Widget no dashboard
- Atualização automática (cache de 1 dia)
- Uso em cálculos de projeção

#### Benefícios
- ✅ Contexto macroeconômico
- ✅ Tomada de decisão informada
- ✅ Diferencial de informação

#### Dependências
- Integração com API externa
- Sistema de cache

#### API Sugerida
- [API do Banco Central](https://www.bcb.gov.br/estabilidadefinanceira/buscaseries/api)

---

## 🎯 Roadmap de Implementação Sugerido

### Fase 1: Base (Em Andamento) 🟡
- ✅ Gestão de Contas
- ✅ Lançamentos básicos
- ✅ Categorias
- ✅ Dashboard inicial
- ✅ Cartões de Crédito

**Status**: Parcialmente implementado

---

### Fase 2: Produtividade (3-6 meses) 📅

#### Prioridade 1: Importação de Extratos
- [ ] TICKET-002: Importação de Extratos OFX
- [ ] TICKET-003: Importação de Planilhas (XLS/CSV)
- [ ] Interface de upload e reconciliação

**Estimativa**: 8-12 horas  
**Dependências**: Sistema de lançamentos completo

---

#### Prioridade 2: Categorização Automática Básica
- [ ] TICKET-004: Sistema de Categorização Automática (Versão Simples)
- [ ] Dicionário de palavras-chave
- [ ] Regras configuráveis
- [ ] Interface de correção

**Estimativa**: 6-8 horas  
**Dependências**: Sistema de categorias e lançamentos

---

#### Prioridade 3: Planejamento Orçamentário
- [ ] TICKET-005: Planejamento Orçamentário Mensal
- [ ] CRUD de orçamentos
- [ ] Cálculo planejado vs realizado
- [ ] Dashboard comparativo

**Estimativa**: 10-14 horas  
**Dependências**: Categorias e lançamentos

---

### Fase 3: Inteligência (6-12 meses) 🤖

#### Prioridade 4: Categorização com IA
- [ ] TICKET-006: Integração com IA para Categorização
- [ ] API OpenAI ou similar
- [ ] Aprendizado com histórico
- [ ] Sugestões inteligentes

**Estimativa**: 12-16 horas  
**Dependências**: Versão básica de categorização

---

#### Prioridade 5: Projeção de Fluxo de Caixa
- [ ] TICKET-007: Projeção de Fluxo de Caixa
- [ ] Cálculos de projeção
- [ ] Gráfico temporal
- [ ] Alertas de saldo negativo

**Estimativa**: 10-12 horas  
**Dependências**: Lançamentos com recorrência

---

#### Prioridade 6: Gestão de Patrimônio
- [ ] TICKET-008: Gestão de Patrimônio
- [ ] CRUD de ativos
- [ ] Histórico de valoração
- [ ] Gráficos de evolução

**Estimativa**: 12-14 horas  
**Dependências**: Dashboard com gráficos

---

#### Prioridade 7: Planos com Parcelamento
- [ ] TICKET-009: Planos Individuais com Parcelamento
- [ ] Sistema de planos
- [ ] Distribuição automática
- [ ] Dashboard de progresso

**Estimativa**: 8-10 horas  
**Dependências**: Metas ou módulo similar

---

### Fase 4: Diferenciais (12+ meses) 🚀

#### Prioridade 8: Indicadores Econômicos
- [ ] TICKET-010: Integração com Indicadores do Banco Central
- [ ] Widget de indicadores
- [ ] Cache de dados
- [ ] Uso em projeções

**Estimativa**: 4-6 horas  
**Dependências**: Integração com APIs externas

---

#### Prioridade 9: Importação de PDF
- [ ] TICKET-011: Importação de Extratos PDF
- [ ] OCR para extração de dados
- [ ] Parser de layouts bancários

**Estimativa**: 16-20 horas  
**Dependências**: Biblioteca de OCR

---

#### Prioridade 10: Open Banking (Futuro)
- [ ] TICKET-012: Integração com Open Banking
- [ ] Conectores com bancos
- [ ] Sincronização automática
- [ ] Autenticação OAuth

**Estimativa**: 40+ horas  
**Dependências**: Backend robusto, compliance

---

## 💡 Funcionalidades Específicas para Casais

### Diferenciação do FinCouples

1. **Metas Compartilhadas vs Individuais**
   - Cada parceiro pode ter metas pessoais
   - Metas do casal são compartilhadas
   - Visão individual e consolidada

2. **Alertas Colaborativos**
   - Notificação quando parceiro está próximo do limite
   - Compartilhamento de grandes gastos
   - Comentários em lançamentos

3. **Visão Dual**
   - Dashboard individual de cada parceiro
   - Dashboard consolidado do casal
   - Filtros por pessoa

4. **Sincronização em Tempo Real** (Futuro)
   - Backend com WebSockets
   - Atualizações instantâneas
   - Colaboração simultânea

---

## 📚 Recursos e Referências

### Bibliotecas Úteis

#### Para Gráficos
- `recharts` - Gráficos React (recomendado)
- `chart.js` / `react-chartjs-2` - Alternativa popular
- `victory` - Biblioteca de visualização

#### Para Importação
- `ofx-parser` - Parser de arquivos OFX
- `xlsx` - Leitura/escrita de Excel
- `exceljs` - Alternativa mais robusta para Excel
- `pdf-parse` - Extração de texto de PDF
- `pdf.js` - Renderização de PDF no navegador

#### Para IA/Categorização
- OpenAI API - GPT para categorização inteligente
- TensorFlow.js - Machine learning no navegador
- `natural` - Processamento de linguagem natural (Node.js)

#### Para Integrações
- Banco Central API: https://www.bcb.gov.br/estabilidadefinanceira/buscaseries/api
- Open Banking Brasil: https://openbankingbrasil.org.br

---

## 🔄 Notas de Implementação

### Padrões a Seguir

1. **Sempre mobile-first**: Funcionalidades devem funcionar bem no mobile
2. **Feedback visual**: Loading states, mensagens de sucesso/erro
3. **Validações robustas**: Prevenir dados inválidos
4. **Acessibilidade**: ARIA labels, navegação por teclado
5. **Performance**: Lazy loading, cache quando apropriado

### Arquitetura

- Manter estrutura modular
- Services para lógica de negócio
- Context API para estado global
- Hooks customizados para reutilização

### Persistência

- Atualmente: localStorage
- Futuro: Backend com banco de dados
- Migração planejada para não perder dados

---

## 📝 Changelog

| Data | Versão | Mudanças |
|------|--------|----------|
| 2024 | 1.0 | Criação inicial do documento |

---

**Última Atualização**: 2024  
**Próxima Revisão**: Após conclusão da Fase 1
