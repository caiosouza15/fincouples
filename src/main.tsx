import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { seedAllIfEmpty } from './utils/seedUtils'

// Inicializar dados mock antes de renderizar
async function initApp() {
  // Popular dados mock se necessário
  await seedAllIfEmpty();
  
  // Pequeno delay para garantir que o localStorage foi atualizado
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Renderizar aplicação
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

initApp();
