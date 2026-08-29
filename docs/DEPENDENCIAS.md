# Estado funcional e roadmap

> Inventário atualizado em agosto de 2026. Separa funcionalidades disponíveis de ideias futuras; não representa um cronograma contratado.

## 1. Funcionalidades disponíveis

### Base financeira

- [x] CRUD de contas correntes, poupanças e investimentos.
- [x] Saldo consolidado e saldo disponível por mês.
- [x] Categorias de receita e despesa.
- [x] Receitas e despesas associadas a conta, cartão e pessoa.
- [x] Lançamentos parcelados e marcação de pagamento.

### Cartões e faturas

- [x] CRUD de cartões.
- [x] Limite total, utilizado e disponível.
- [x] Fechamento e vencimento.
- [x] Geração de fatura por mês.
- [x] Pagamento total ou parcial.
- [x] Alertas de vencimento.

### Casal e acesso

- [x] Autenticação por e-mail e senha com Supabase.
- [x] Onboarding, criação do casal e convite do parceiro.
- [x] Identificação de `usuario1` e `usuario2`.
- [x] Visão consolidada e filtros por pessoa.

### Análise e experiência

- [x] Dashboard mensal e metas financeiras.
- [x] Relatórios por período, categoria, cartão, pagamento e pessoa.
- [x] Previsões baseadas em parcelas e vencimentos cadastrados.
- [x] Ocultação global ou por seção de valores.
- [x] Temas claro e escuro.
- [x] Modo mock local para desenvolvimento.

## 2. Infraestrutura

- [x] Contratos únicos de repositório.
- [x] Fontes de dados `localStorage` e Supabase.
- [x] Seleção por variáveis de ambiente.
- [x] Tipos do banco Supabase no frontend.
- [x] Cache da identificação do casal na sessão.
- [ ] Migrações SQL e políticas RLS versionadas.
- [ ] Testes unitários, de integração e end-to-end.
- [ ] Pipeline de integração contínua.
- [ ] Sincronização em tempo real.
- [ ] Monitoramento de produção.

## 3. Próximas prioridades técnicas

1. Eliminar os erros e avisos atuais do lint.
2. Testar cálculos de saldo, parcelas, períodos e faturas.
3. Versionar schema, RPCs e políticas RLS do Supabase.
4. Documentar ambientes e implantação.
5. Revisar tratamento de erros e carregamento.
6. Remover ou isolar demos e código legado.
7. Adicionar tempo real ou estratégia explícita de revalidação.

## 4. Roadmap de produto sugerido

### Prioridade alta

#### Planejamento orçamentário

- orçamento por categoria e mês;
- planejado versus realizado;
- alertas de aproximação e estouro;
- histórico mensal.

#### Importação de extratos

1. OFX;
2. CSV/XLSX com mapeamento de colunas;
3. reconciliação e duplicatas;
4. PDF/OCR após estabilizar formatos estruturados.

#### Recorrências

- receitas e despesas recorrentes;
- projeção de ocorrências futuras;
- edição de ocorrência ou série;
- integração com fluxo de caixa.

### Prioridade média

- categorização automática inicialmente baseada em regras locais;
- projeção de fluxo de caixa de 6 a 12 meses;
- gestão e evolução patrimonial;
- distinção entre metas individuais e compartilhadas.

### Prioridade futura

- indicadores do Banco Central;
- comentários e alertas colaborativos;
- notificações push;
- categorização assistida por IA;
- integrações bancárias/Open Finance;
- importação de documentos por OCR.

## 5. Critérios para priorização

- impacto na rotina financeira do casal;
- segurança e privacidade;
- consistência entre mock e Supabase;
- clareza das regras financeiras;
- custo de manutenção e teste;
- dependência e custo de serviços externos.

## 6. Princípios do produto

- Visão compartilhada sem apagar a responsabilidade individual.
- Linguagem simples para regras financeiras complexas.
- Privacidade como comportamento padrão.
- Dados do casal isolados no backend.
- Experiência mobile-first e acessível.
- Feedback claro para carregamento, sucesso, falha e ausência de dados.

## 7. Histórico

| Data | Alteração |
|---|---|
| 2024 | Criação do roadmap inicial. |
| Agosto de 2026 | Revisão para refletir Supabase, convites, metas, faturas e relatórios implementados. |
