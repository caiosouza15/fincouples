import { Link } from 'react-router-dom';

const APP_VERSION = 'v1.0';

interface FooterProps {
  sidebarExpanded?: boolean;
}

export function Footer({ sidebarExpanded = false }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface shrink-0">
      <div
        className={`px-lg py-3 md:py-4 transition-[margin-left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          sidebarExpanded ? 'md:ml-[240px]' : 'md:ml-16'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 text-sm text-text-muted">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1">
            <Link
              to="/home"
              className="font-medium text-text-secondary hover:text-teal transition-colors duration-200"
            >
              Nós
            </Link>
            <span>© {year}</span>
            <span className="hidden sm:inline" aria-hidden>·</span>
            <span>{APP_VERSION}</span>
          </div>
          <span>Desenvolvido por Caio Souza</span>
        </div>
      </div>
    </footer>
  );
}
