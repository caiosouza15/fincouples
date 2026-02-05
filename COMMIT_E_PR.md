# Instruções para Push e Pull Request

## ✅ Commit Realizado

O commit foi criado com sucesso na branch `card`:

```
feat: implementa sistema de privacidade para valores numéricos

- Adiciona PrivacyContext com estado global e persistência no localStorage
- Cria função formatCurrencyWithPrivacy com suporte a blur
- Adiciona classe CSS .blur-value para efeito de blur
- Integra privacidade em todos os valores do Dashboard
- Separa funcionalidade de privacidade de ativar/desativar (olho vs Power)
- Aplica privacidade em: saldo geral, receitas, despesas, gastos, faturas, contas e cartões
- Adiciona documentação completa da implementação
```

**Hash do commit:** `4ee60ad`

## 🚀 Próximos Passos

### 1. Fazer Push da Branch

Execute o seguinte comando no terminal:

```bash
git push -u origin card
```

### 2. Criar Pull Request

Você pode criar o Pull Request de duas formas:

#### Opção A: Via GitHub CLI (se instalado)

```bash
gh pr create --title "feat: Sistema de Privacidade para Valores Numéricos" \
  --body "$(cat PRIVACIDADE_IMPLEMENTACAO.md)" \
  --base main
```

#### Opção B: Via Interface Web do GitHub

1. Acesse: https://github.com/caiosouza15/fincouples
2. Você verá uma notificação para criar um PR da branch `card`
3. Clique em "Compare & pull request"
4. Preencha:
   - **Título:** `feat: Sistema de Privacidade para Valores Numéricos`
   - **Descrição:** Copie o conteúdo do arquivo `PRIVACIDADE_IMPLEMENTACAO.md`
5. Selecione a branch base: `main` (ou a branch que você deseja fazer merge)
6. Clique em "Create pull request"

### 3. Descrição Sugerida para o PR

```markdown
## 📋 Resumo

Implementação de um sistema global de privacidade que permite ocultar/mostrar todos os valores numéricos da aplicação através de um único botão de controle no card "Saldo geral".

## ✨ Funcionalidades

- ✅ Controle global de privacidade via botão no card "Saldo geral"
- ✅ Efeito de blur nos valores quando ocultos
- ✅ Persistência da preferência no localStorage
- ✅ Aplicado em todos os valores do Dashboard (saldo, receitas, despesas, gastos, faturas, contas e cartões)
- ✅ Separação de responsabilidades: ícone olho para privacidade, ícone Power para ativar/desativar

## 📁 Arquivos Principais

- `src/contexts/PrivacyContext.tsx` - Contexto de privacidade
- `src/utils/formatCurrency.tsx` - Função com suporte a blur
- `src/modules/Dashboard/Dashboard.tsx` - Integração completa
- `PRIVACIDADE_IMPLEMENTACAO.md` - Documentação detalhada

## 🧪 Testes

- ✅ Build compilando sem erros
- ✅ Linter sem erros
- ✅ Todas as funcionalidades implementadas

## 📚 Documentação

Consulte `PRIVACIDADE_IMPLEMENTACAO.md` para documentação completa.
```

## 📊 Estatísticas do Commit

- **10 arquivos alterados**
- **505 inserções, 46 deleções**
- **Arquivos novos:** PrivacyContext, usePrivacy hook, documentação
- **Arquivos modificados:** Dashboard, ContaItem, CartaoItem, App, index.css

## ⚠️ Nota

Se o push falhar por questões de autenticação SSH, verifique:
- Suas chaves SSH estão configuradas corretamente
- Você tem permissão de escrita no repositório
- Ou use HTTPS: `git remote set-url origin https://github.com/caiosouza15/fincouples.git`
