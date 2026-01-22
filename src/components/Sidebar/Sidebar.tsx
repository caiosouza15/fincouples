import './Sidebar.css';

type ViewType = 'dashboard' | 'lancamentos' | 'relatorios' | 'metas' | 'configuracoes';

interface SidebarProps {
  expanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose?: () => void;
  onNavigate: (view: ViewType) => void;
  currentView: ViewType;
}

interface NavItem {
  id: ViewType;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Visão Geral', icon: '📊' },
  { id: 'lancamentos', label: 'Lançamentos', icon: '💰' },
  { id: 'relatorios', label: 'Relatórios', icon: '📈' },
  { id: 'metas', label: 'Metas', icon: '🎯' },
  { id: 'configuracoes', label: 'Configurações', icon: '⚙️' },
];

export const Sidebar = ({ expanded, onMouseEnter, onMouseLeave, onClose, onNavigate, currentView }: SidebarProps) => {
  const handleItemClick = (view: ViewType) => {
    onNavigate(view);
    if (window.innerWidth <= 768 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {expanded && (
        <div 
          className="fixed top-[64px] left-0 right-0 bottom-0 bg-black/50 z-[85] md:hidden animate-[overlayFadeIn_0.3s_ease]"
          onClick={onClose} 
          aria-hidden="true" 
        />
      )}
      
      <aside 
        className={`sidebar fixed left-0 top-[64px] bottom-0 bg-surface border-r border-border shadow-sm transition-[width,transform,box-shadow] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-[90] overflow-hidden ${
          expanded ? 'sidebar-expanded w-[240px] shadow-md translate-x-0' : 'sidebar-collapsed w-16 -translate-x-full md:translate-x-0'
        }`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {expanded && onClose && (
          <button 
            className="absolute top-md right-md w-8 h-8 flex md:hidden items-center justify-center rounded-md bg-background text-text-secondary text-lg border border-border transition-all duration-200 z-10 hover:bg-negative hover:text-white hover:border-negative"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            ✕
          </button>
        )}
        
        <nav className="flex flex-col p-md px-sm gap-xs h-full overflow-y-auto overflow-x-hidden sidebar-nav">
          {navItems.map((item) => {
            const isActive = item.id === currentView;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`group relative flex items-center gap-md p-md rounded-md text-text-secondary no-underline transition-all duration-200 whitespace-nowrap cursor-pointer select-none sidebar-item border-none bg-transparent w-full text-left ${
                  isActive 
                    ? 'bg-positive/10 text-positive font-medium sidebar-item-active' 
                    : 'hover:bg-background hover:text-text-primary'
                }`}
                aria-label={item.label}
              >
                <span className={`text-xl shrink-0 w-6 h-6 text-center flex items-center justify-center transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                <span className={`text-base font-medium transition-all duration-300 sidebar-label ${expanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2.5 md:group-hover:opacity-100 md:group-hover:translate-x-0'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
