import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Menu, Bell, Settings, User } from 'lucide-react';
import { ContasProvider } from './contexts/ContasContext';
import { CategoriasProvider } from './contexts/CategoriasContext';
import { Dashboard } from './modules/Dashboard';
import { Sidebar } from './components/Sidebar';
import { Configuracoes } from './modules/Configuracoes';
import { Lancamentos } from './modules/Lancamentos';
import { Relatorios } from './modules/Relatorios';
import { Metas } from './modules/Metas';

function AppContent() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const navigate = useNavigate();

  const handleConfigClick = () => {
    navigate('/configuracoes');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-positive text-white shadow-md fixed top-0 left-0 right-0 z-[100] h-16">
        <div className="w-full h-full px-lg py-md flex items-center justify-between gap-lg md:px-md">
          <button 
            className="flex md:hidden w-9 h-9 items-center justify-center bg-transparent text-white border-none rounded-md cursor-pointer transition-colors duration-200 hover:bg-white/10"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            aria-label="Abrir menu"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold m-0 text-white">fincouples</h1>
          <div className="flex items-center gap-md">
            <button className="w-9 h-9 flex items-center justify-center rounded-md bg-transparent text-white/90 transition-colors duration-200 cursor-pointer hover:bg-white/10" aria-label="Notificacoes">
              <Bell size={20} />
            </button>
            <button 
              className="w-9 h-9 flex items-center justify-center rounded-md bg-transparent text-white/90 transition-colors duration-200 cursor-pointer hover:bg-white/10" 
              aria-label="Configuracoes"
              onClick={handleConfigClick}
            >
              <Settings size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-white/30">
              <User size={18} />
            </div>
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
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lancamentos" element={<Lancamentos />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/metas" element={<Metas />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CategoriasProvider>
        <ContasProvider>
          <AppContent />
        </ContasProvider>
      </CategoriasProvider>
    </BrowserRouter>
  );
}

export default App;
