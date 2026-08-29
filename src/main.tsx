import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/glass-tokens.css'
import App from './App.tsx'
import { seedAllIfEmpty } from './utils/seedUtils'
import { isApiConfigured } from './data/config'

// Inicializar dados mock antes de renderizar
async function initApp() {
  // Seed só faz sentido no modo mock (localStorage). No Supabase, o seed de
  // categorias padrão acontece no banco, dentro de criar_casal(), e tentar
  // rodar isso aqui falharia por não haver sessão autenticada ainda.
  if (!isApiConfigured()) {
    // Popular dados mock (substitui automaticamente se detectar formato antigo ou force_seed no sessionStorage)
    await seedAllIfEmpty();

    // Pequeno delay para o localStorage estar disponível antes dos contexts lerem
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  // Renderizar aplicação
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

initApp();
