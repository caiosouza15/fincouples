import { useState } from 'react';
import { Dashboard } from './modules/Dashboard';
import { Sidebar } from './components/Sidebar';
import './App.css';

function App() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <button 
            className="app-menu-toggle"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            aria-label="Abrir menu"
          >
            ☰
          </button>
          <h1 className="app-logo">fincouples</h1>
          <div className="app-header-actions">
            <button className="icon-button" aria-label="Notificações">🔔</button>
            <button className="icon-button" aria-label="Configurações">⚙️</button>
            <div className="user-avatar">👤</div>
          </div>
        </div>
      </header>
      
      <div className="app-layout">
        <Sidebar 
          expanded={sidebarExpanded}
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
          onClose={() => setSidebarExpanded(false)}
        />
        
        <main className={`app-main ${sidebarExpanded ? 'sidebar-expanded-main' : ''}`}>
          <Dashboard />
        </main>
      </div>
    </div>
  );
}

export default App;
