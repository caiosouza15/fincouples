import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ContasProvider } from './contexts/ContasContext';
import { CategoriasProvider } from './contexts/CategoriasContext';
import { LancamentosProvider } from './contexts/LancamentosContext';
import { CartoesProvider } from './contexts/CartoesContext';
import { FaturasProvider } from './contexts/FaturasContext';
import { PrivacyProvider } from './contexts/PrivacyContext';
import { ToastProvider } from './contexts/ToastContext';
import { CasalProvider } from './contexts/CasalContext';
import { MetasProvider } from './contexts/MetasContext';
import { SelectedMonthProvider } from './contexts/SelectedMonthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastContainer } from './components/Toast/ToastContainer';
import { AppShell } from './components/AppShell/AppShell';
import { AuthGate } from './modules/Auth/AuthGate';
import { migrateAllCasalData } from './utils/migrateCasalData';
import { Configuracoes } from './modules/Configuracoes';
import { Lancamentos } from './modules/Lancamentos';
import { Relatorios } from './modules/Relatorios';
import { Metas } from './modules/Metas';
import { Contas } from './modules/Contas';
import { Cartoes } from './modules/Cartoes';
import { Dashboard } from './modules/Dashboard';

function AppContent() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Dashboard />} />
        <Route path="/lancamentos" element={<Lancamentos />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/metas" element={<Metas />} />
        <Route path="/contas" element={<Contas />} />
        <Route path="/cartoes" element={<Cartoes />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
      </Routes>
      <ToastContainer />
    </AppShell>
  );
}

function App() {
  // Executar migração uma vez na inicialização
  React.useEffect(() => {
    migrateAllCasalData();
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <PrivacyProvider>
          <ToastProvider>
            <CasalProvider>
              <SelectedMonthProvider>
                <AuthGate>
                  <CategoriasProvider>
                    <ContasProvider>
                      <CartoesProvider>
                        <FaturasProvider>
                          <MetasProvider>
                            <LancamentosProvider>
                              <AppContent />
                            </LancamentosProvider>
                          </MetasProvider>
                        </FaturasProvider>
                      </CartoesProvider>
                    </ContasProvider>
                  </CategoriasProvider>
                </AuthGate>
              </SelectedMonthProvider>
            </CasalProvider>
          </ToastProvider>
        </PrivacyProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
