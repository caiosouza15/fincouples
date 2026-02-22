import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { seedAllIfEmpty } from './utils/seedUtils'

// Inicializar dados mock antes de renderizar
async function initApp() {
  // Popular dados mock (substitui automaticamente se detectar formato antigo ou force_seed no sessionStorage)
  await seedAllIfEmpty();

  // Pequeno delay para o localStorage estar disponível antes dos contexts lerem
  await new Promise((resolve) => setTimeout(resolve, 150));

  // Renderizar aplicação
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

initApp();
