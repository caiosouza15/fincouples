import { useEffect, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './AppShell.module.css';
import {
  IconHome,
  IconList,
  IconBarChart,
  IconTarget,
  IconWallet,
  IconCard,
  IconSettings,
  IconSearch,
  IconSun,
  IconMoon,
  IconBell,
} from '@/components/GlassIcons';
import { useCasal } from '@/contexts/CasalContext';
import { useSelectedMonth } from '@/contexts/SelectedMonthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Logo } from '@/components/Logo';

const RAIL_ITEMS = [
  { path: '/home', Icon: IconHome, label: 'Início' },
  { path: '/lancamentos', Icon: IconList, label: 'Lançamentos' },
  { path: '/relatorios', Icon: IconBarChart, label: 'Relatórios' },
  { path: '/metas', Icon: IconTarget, label: 'Metas' },
  { path: '/contas', Icon: IconWallet, label: 'Contas' },
  { path: '/cartoes', Icon: IconCard, label: 'Cartões' },
  { path: '/configuracoes', Icon: IconSettings, label: 'Configurações' },
];

function formatMonthLabel(yyyyMm: string): string {
  const [year, month] = yyyyMm.split('-').map(Number);
  if (!year || !month) return yyyyMm;
  const label = new Date(year, month - 1, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario1Nome, usuario2Nome, parceiroJaEntrou } = useCasal();
  const { selectedMonth } = useSelectedMonth();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  const initial1 = usuario1Nome.trim().charAt(0).toUpperCase() || '?';
  const initial2 = usuario2Nome.trim().charAt(0).toUpperCase() || '?';

  return (
    <div className={styles.shell}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.blob3} />

      <div className={styles.container}>
        <nav className={styles.rail} aria-label="Navegação principal">
          {RAIL_ITEMS.map(({ path, Icon, label }, i) => (
            <RailLink
              key={path}
              path={path}
              icon={<Icon />}
              label={label}
              active={location.pathname === path}
              withSeparator={i === RAIL_ITEMS.length - 1}
            />
          ))}
        </nav>

        <div className={styles.mainCol}>
          <header className={styles.header}>
            <div className={styles.identityPill}>
              <span className={styles.identityLogo}>
                <Logo size={30} />
              </span>
              <div className={styles.identityDivider} />
              <div className={`${styles.avatar} ${styles.avatarP1}`}>{initial1}</div>
              {parceiroJaEntrou && (
                <div className={`${styles.avatar} ${styles.avatarP2}`}>{initial2}</div>
              )}
              <div className={styles.identityText}>
                <span className={styles.identityName}>
                  {parceiroJaEntrou ? `${usuario1Nome} & ${usuario2Nome}` : usuario1Nome}
                </span>
                <span className={styles.identityMonth}>{formatMonthLabel(selectedMonth)}</span>
              </div>
            </div>

            <div className={styles.search}>
              <IconSearch />
              <input
                className={styles.searchInput}
                type="text"
                placeholder="Buscar lançamentos, categorias..."
                readOnly
              />
            </div>

            <div className={styles.themeToggle}>
              <button
                type="button"
                className={`${styles.themeBtn} ${resolvedTheme === 'light' ? styles.themeBtnActive : ''}`}
                onClick={() => setTheme('light')}
                aria-pressed={resolvedTheme === 'light'}
              >
                <IconSun />
                Claro
              </button>
              <button
                type="button"
                className={`${styles.themeBtn} ${resolvedTheme === 'dark' ? styles.themeBtnActive : ''}`}
                onClick={() => setTheme('dark')}
                aria-pressed={resolvedTheme === 'dark'}
              >
                <IconMoon />
                Escuro
              </button>
            </div>

            <button
              type="button"
              className={styles.bell}
              aria-label="Notificações"
              onClick={() => navigate('/configuracoes')}
            >
              <IconBell />
            </button>
          </header>

          <main className={styles.mainContent}>{children}</main>
        </div>
      </div>
    </div>
  );
}

interface RailLinkProps {
  path: string;
  icon: ReactNode;
  label: string;
  active: boolean;
  withSeparator?: boolean;
}

function RailLink({ path, icon, label, active, withSeparator }: RailLinkProps) {
  return (
    <>
      {withSeparator && <div className={styles.railSep} />}
      <Link
        to={path}
        className={`${styles.railBtn} ${active ? styles.railBtnActive : ''}`}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
      >
        {icon}
        <span className={styles.railTooltip} role="tooltip">{label}</span>
      </Link>
    </>
  );
}
