import './Sidebar.css';

interface SidebarProps {
  expanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Visão Geral', icon: '📊', href: '#', active: true },
  { id: 'lancamentos', label: 'Lançamentos', icon: '💰', href: '#' },
  { id: 'relatorios', label: 'Relatórios', icon: '📈', href: '#' },
  { id: 'metas', label: 'Metas', icon: '🎯', href: '#' },
  { id: 'configuracoes', label: 'Configurações', icon: '⚙️', href: '#' },
];

export const Sidebar = ({ expanded, onMouseEnter, onMouseLeave, onClose }: SidebarProps) => {
  return (
    <>
      {/* Overlay para mobile */}
      {expanded && <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />}
      
      <aside 
        className={`sidebar ${expanded ? 'sidebar-expanded' : ''}`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Botão de fechar para mobile */}
        {expanded && onClose && (
          <button 
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            ✕
          </button>
        )}
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`sidebar-item ${item.active ? 'sidebar-item-active' : ''}`}
              aria-label={item.label}
              onClick={() => {
                // Fecha a sidebar no mobile ao clicar em um item
                if (window.innerWidth <= 768 && onClose) {
                  onClose();
                }
              }}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
};