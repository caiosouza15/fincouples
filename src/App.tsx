import { Dashboard } from './modules/Dashboard';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <h1 className="app-logo">fincouples</h1>
          <nav className="app-nav">
            <a href="#" className="nav-link active">Visão Geral</a>
            <a href="#" className="nav-link">Lançamentos</a>
            <a href="#" className="nav-link">Relatórios</a>
            <a href="#" className="nav-link">Metas</a>
          </nav>
          <div className="app-header-actions">
            <button className="icon-button" aria-label="Notificações">🔔</button>
            <button className="icon-button" aria-label="Configurações">⚙️</button>
            <div className="user-avatar">👤</div>
          </div>
        </div>
      </header>
      
      <main className="app-main">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
