# Pull Request: Melhorias na jornada de cartões de crédito

## Branch
`feat/melhorias-jornada-cartoes-credito` → `main`

## Resumo
Implementação completa das melhorias na jornada de cartões de crédito: identificação por pessoa do casal, relatórios por pessoa, correções de UX (máscara de valores, filtros) e novos componentes de feedback.

---

## Alterações principais

### Jornada de cartão de crédito
- **Múltiplos cartões:** fluxo ajustado para suportar vários cartões (botão "Adicionar" sempre visível no header do card).
- **Proprietário e tipo:** formulário de cartão com campos "Proprietário" (usuario1/usuario2) e "Tipo" (principal/adicional).
- **Filtros:** busca por nome, filtro por status (todos/ativos/inativos), filtro por proprietário, ordenação (nome, limite, uso, fechamento).
- **Visualização:** toggle entre cards e lista; ícones e padding dos filtros ajustados (selects com ChevronDown centralizado).
- **Componentes:** `CartaoCard`, `ResumoCard`, `FaturaDetalhes`, `AlertasCard`; hook `useAlertasVencimento`.

### Identificação do casal
- **CasalContext:** nomes das duas pessoas (usuario1/usuario2) persistidos em localStorage.
- **Configurações → Casal:** tela para editar nomes do casal.
- **Cartões:** `proprietarioId`, `tipo`, `nomeProprietario` em `CartaoCredito`.
- **Lançamentos:** `pessoaId`, `nomePessoa` em despesas; exibição em `LancamentoItem` e `FaturaDetalhes`.
- **Migração:** `migrateCasalData.ts` preenche valores padrão em dados existentes (uma única execução).

### Relatórios
- **Relatórios por pessoa:** seção em Relatórios com totais por pessoa, distribuição de gastos, gastos por categoria e comparativo.

### Correções e UX
- **Máscara de valores:** em `numberMask.ts`, pontos de milhar (ex.: "19.000") passam a ser removidos ao processar string, evitando valor exibido como "1,90" ao digitar acima de 1.000.
- **Toasts:** `ToastContext` e componente `ToastContainer` para feedback de ações.
- **ConfirmDialog:** diálogo reutilizável para confirmações (ex.: excluir).
- **Privacidade:** controle por seção mantido; botão de privacidade no card "Meus cartões".

---

## Arquivos modificados
- `src/App.tsx` – CasalProvider, migração inicial
- `src/contexts/CartoesContext.tsx` – addCartao retorna cartão criado
- `src/modules/Cartoes/Cartoes.tsx` – filtros, layout, ícones
- `src/modules/Configuracoes/Cartoes/CartaoForm.tsx` – proprietário, tipo, máscara
- `src/modules/Configuracoes/Configuracoes.tsx` – aba Casal
- `src/modules/Lancamentos/LancamentoForm.tsx` – campo "Quem realizou"
- `src/modules/Lancamentos/LancamentoItem.tsx` – badge pessoa
- `src/modules/Lancamentos/LancamentosList.tsx` – filtro por pessoa
- `src/modules/Relatorios/Relatorios.tsx` – RelatoriosPorPessoa
- `src/utils/numberMask.ts` – correção formatação valores > 1000
- `src/types/index.ts` – campos opcionais casal/lançamento
- Outros: EmptyState, FaturaItem, FaturasList, hooks/index

## Arquivos novos
- `src/contexts/CasalContext.tsx`, `ToastContext.tsx`
- `src/components/AlertasCard.tsx`, `CartaoCard.tsx`, `ConfirmDialog.tsx`, `Toast/`
- `src/hooks/useAlertasVencimento.ts`, `useCasal.ts`, `useToast.ts`
- `src/modules/Cartoes/FaturaDetalhes.tsx`, `ResumoCard.tsx`
- `src/modules/Configuracoes/Casal/`
- `src/modules/Relatorios/RelatoriosPorPessoa.tsx`
- `src/utils/migrateCasalData.ts`

---

## Checklist
- [ ] Testar adicionar/editar cartão com limite > 1000 (ex.: 19.000)
- [ ] Testar filtros e ordenação em Meus cartões
- [ ] Configurar nomes em Configurações → Casal
- [ ] Cadastrar despesa com "Quem realizou" e conferir em Relatórios por pessoa
- [ ] Verificar toasts ao salvar/excluir e confirmação ao excluir
