import './Sidebar.css';
import { NavLink } from 'react-router-dom';
import { iconMap } from '@/utils/iconMap';
import { X } from 'lucide-react';

interface SidebarProps {
  expanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose?: () => void;
}

interface NavItem {
  path: string;
  label: string;
  iconName: string;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Visao Geral', iconName: 'dashboard' },
  { path: '/lancamentos', label: 'Lancamentos', iconName: 'lancamentos' },
  { path: '/relatorios', label: 'Relatorios', iconName: 'relatorios' },
  { path: '/metas', label: 'Metas', iconName: 'metas' },
  { path: '/configuracoes', label: 'Configuracoes', iconName: 'configuracoes' },
];

export const Sidebar = ({ expanded, onMouseEnter, onMouseLeave, onClose }: SidebarProps) => {
  const handleItemClick = () => {
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
            className="absolute top-md right-md w-8 h-8 flex md:hidden items-center justify-center rounded-md bg-background text-text-secondary border border-border transition-all duration-200 z-10 hover:bg-negative hover:text-white hover:border-negative"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        )}
        
        <nav className="flex flex-col p-md px-sm gap-xs h-full overflow-y-auto overflow-x-hidden sidebar-nav">
          {navItems.map((item) => {
            const IconComponent = iconMap[item.iconName];
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleItemClick}
                className={({ isActive }) =>
                  `group relative flex items-center gap-md p-md rounded-md text-text-secondary no-underline transition-all duration-200 whitespace-nowrap cursor-pointer select-none sidebar-item border-none bg-transparent w-full text-left ${
                    isActive 
                      ? 'bg-positive/10 text-positive font-medium sidebar-item-active' 
                      : 'hover:bg-background hover:text-text-primary'
                  }`
                }
                aria-label={item.label}
              >
                {({ isActive }) => (
                  <>
                    <span className={`shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`}>
                      {IconComponent && <IconComponent size={20} className={isActive ? 'text-positive' : 'text-text-secondary'} />}
                    </span>
                    <span className={`text-base font-medium transition-all duration-300 sidebar-label ${expanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2.5 md:group-hover:opacity-100 md:group-hover:translate-x-0'}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
