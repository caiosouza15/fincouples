interface IconProps {
  size?: number;
}

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
};

export function IconHome({ size = 20 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.5V19a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

export function IconList({ size = 20 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <line x1="5" y1="7" x2="19" y2="7" />
      <line x1="5" y1="12" x2="19" y2="12" />
      <line x1="5" y1="17" x2="13" y2="17" />
    </svg>
  );
}

export function IconBarChart({ size = 20 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <line x1="6" y1="20" x2="6" y2="10" />
      <line x1="12" y1="20" x2="12" y2="5" />
      <line x1="18" y1="20" x2="18" y2="14" />
    </svg>
  );
}

export function IconTarget({ size = 20 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  );
}

export function IconCard({ size = 20 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <line x1="3" y1="10.5" x2="21" y2="10.5" />
      <line x1="6.5" y1="15" x2="10.5" y2="15" />
    </svg>
  );
}

export function IconSettings({ size = 20 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <line x1="4" y1="7" x2="20" y2="7" />
      <circle cx="14" cy="7" r="2" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <circle cx="8" cy="12" r="2" />
      <line x1="4" y1="17" x2="20" y2="17" />
      <circle cx="16" cy="17" r="2" />
    </svg>
  );
}

export function IconSearch({ size = 18 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="15.3" y1="15.3" x2="20" y2="20" />
    </svg>
  );
}

export function IconSun({ size = 15 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4.5" />
      <line x1="12" y1="19.5" x2="12" y2="22" />
      <line x1="2" y1="12" x2="4.5" y2="12" />
      <line x1="19.5" y1="12" x2="22" y2="12" />
      <line x1="4.9" y1="4.9" x2="6.6" y2="6.6" />
      <line x1="17.4" y1="17.4" x2="19.1" y2="19.1" />
      <line x1="4.9" y1="19.1" x2="6.6" y2="17.4" />
      <line x1="17.4" y1="6.6" x2="19.1" y2="4.9" />
    </svg>
  );
}

export function IconMoon({ size = 15 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
    </svg>
  );
}

export function IconBell({ size = 19 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6.3H4C4.5 14.5 6 13 6 9Z" />
      <path d="M9.5 18a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}

export function IconWallet({ size = 18 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M5 7.5V5.8A1.8 1.8 0 0 1 6.8 4H17a1.8 1.8 0 0 1 1.8 1.8v1.7" />
      <rect x="3" y="7.5" width="18" height="12" rx="2.3" />
      <circle cx="16.3" cy="13.5" r="1.15" />
    </svg>
  );
}

export function IconLink({ size = 18 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <circle cx="9" cy="12" r="5.5" />
      <circle cx="15" cy="12" r="5.5" />
    </svg>
  );
}

export function IconChevronRight({ size = 16 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <polyline points="9 5 16 12 9 19" />
    </svg>
  );
}
