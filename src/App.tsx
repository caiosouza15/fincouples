import { useState } from 'react';
import * as React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Menu, Bell, Settings, User } from 'lucide-react';
import { ContasProvider } from './contexts/ContasContext';
import { CategoriasProvider } from './contexts/CategoriasContext';
import { LancamentosProvider } from './contexts/LancamentosContext';
import { CartoesProvider } from './contexts/CartoesContext';
import { FaturasProvider } from './contexts/FaturasContext';
import { PrivacyProvider } from './contexts/PrivacyContext';
import { ToastProvider } from './contexts/ToastContext';
import { CasalProvider } from './contexts/CasalContext';
import { SelectedMonthProvider, useSelectedMonth } from './contexts/SelectedMonthContext';
import { ToastContainer } from './components/Toast/ToastContainer';
import { migrateAllCasalData } from './utils/migrateCasalData';
import { MonthSelector } from './components/MonthSelector';
import { Dashboard } from './modules/Dashboard';
import { Sidebar } from './components/Sidebar';
import { Configuracoes } from './modules/Configuracoes';
import { Lancamentos } from './modules/Lancamentos';
import { Relatorios } from './modules/Relatorios';
import { Metas } from './modules/Metas';
import { Contas } from './modules/Contas';
import { Cartoes } from './modules/Cartoes';
import logo from './assets/FinCouples_logo_144px.png';

function AppContent() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const navigate = useNavigate();
  const { selectedMonth, setSelectedMonth } = useSelectedMonth();

  const handleConfigClick = () => {
    navigate('/configuracoes');
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-teal text-white shadow-md fixed top-0 left-0 right-0 z-[100] h-16">
        <div className="w-full h-full px-md py-md flex items-center gap-md md:px-lg md:gap-lg relative">
          {/* Seção Esquerda: Menu e Logo */}
          <div className="flex items-center gap-md flex-shrink-0 relative z-10">
            <button 
              className="flex md:hidden w-7 h-7 items-center justify-center bg-transparent text-text-primary border-none rounded-md cursor-pointer transition-colors duration-200 hover:bg-white/10"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              aria-label="Abrir menu"
            >
              <Menu size={20} className="text-text-primary" />
            </button>
            <button
              onClick={handleLogoClick}
              className="hidden md:flex items-center cursor-pointer bg-transparent border-none p-0 transition-opacity duration-200 hover:opacity-80"
              aria-label="Ir para dashboard"
            >
              <img 
                src={logo} 
                alt="fincouples" 
                className="h-10 md:h-12 w-auto"
              />
            </button>
          </div>
          
          {/* Seção Central: MonthSelector - Centralizado absoluto no mobile */}
          <div className="flex-1 flex items-center justify-center min-w-0 md:relative absolute left-0 right-0 md:left-auto md:right-auto pointer-events-none md:pointer-events-auto">
            <div className="pointer-events-auto">
              <MonthSelector 
                selectedMonth={selectedMonth} 
                onMonthChange={setSelectedMonth}
                className="text-white"
              />
            </div>
          </div>
          
          {/* Seção Direita: Ícones */}
          <div className="hidden md:flex items-center gap-md flex-shrink-0">
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
            <Route path="/contas" element={<Contas />} />
            <Route path="/cartoes" element={<Cartoes />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Routes>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

function App() {
  // Executar migração uma vez na inicialização
  React.useEffect(() => {
    migrateAllCasalData();
  }, []);

  return (
    <BrowserRouter>
      <PrivacyProvider>
        <ToastProvider>
          <CasalProvider>
            <SelectedMonthProvider>
              <CategoriasProvider>
                <ContasProvider>
                  <CartoesProvider>
                    <FaturasProvider>
                      <LancamentosProvider>
                        <AppContent />
                      </LancamentosProvider>
                    </FaturasProvider>
                  </CartoesProvider>
                </ContasProvider>
              </CategoriasProvider>
            </SelectedMonthProvider>
          </CasalProvider>
        </ToastProvider>
      </PrivacyProvider>
    </BrowserRouter>
  );
}

export default App;
