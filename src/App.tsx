import { useState } from 'react';
import { ContasProvider } from './contexts/ContasContext';
import { Dashboard } from './modules/Dashboard';
import { Sidebar } from './components/Sidebar';

function App() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <ContasProvider>
      <div className="min-h-screen flex flex-col">
        <header className="bg-positive text-white shadow-md fixed top-0 left-0 right-0 z-[100] h-16">
          <div className="w-full h-full px-lg py-md flex items-center justify-between gap-lg md:px-md">
            <button 
              className="flex md:hidden w-9 h-9 items-center justify-center bg-transparent text-white border-none rounded-md text-xl cursor-pointer transition-colors duration-200 hover:bg-white/10"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              aria-label="Abrir menu"
            >
              ☰
            </button>
            <h1 className="text-xl font-bold m-0 text-white">fincouples</h1>
            <div className="flex items-center gap-md">
              <button className="w-9 h-9 flex items-center justify-center rounded-md bg-transparent text-white/90 transition-colors duration-200 cursor-pointer text-lg hover:bg-white/10" aria-label="Notificações">🔔</button>
              <button className="w-9 h-9 flex items-center justify-center rounded-md bg-transparent text-white/90 transition-colors duration-200 cursor-pointer text-lg hover:bg-white/10" aria-label="Configurações">⚙️</button>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg cursor-pointer transition-colors duration-200 hover:bg-white/30">👤</div>
            </div>
          </div>
        </header>
        
        <div className="flex mt-16 min-h-[calc(100vh-64px)]">
          <Sidebar 
            expanded={sidebarExpanded}
            onMouseEnter={() => setSidebarExpanded(true)}
            onMouseLeave={() => setSidebarExpanded(false)}
            onClose={() => setSidebarExpanded(false)}
          />
          
          <main className={`flex-1 p-lg md:p-md bg-background transition-[margin-left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            sidebarExpanded 
              ? 'ml-0 md:ml-[240px]' 
              : 'ml-0 md:ml-16'
          }`}>
            <Dashboard />
          </main>
        </div>
      </div>
    </ContasProvider>
  );
}

export default App;
