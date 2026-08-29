import { useId } from 'react';
import type { CSSProperties } from 'react';
import styles from './Logo.module.css';

export type LogoVariant = 'lockup' | 'vertical' | 'mark';

interface LogoProps {
  /** "lockup" (símbolo + wordmark, horizontal) | "vertical" | "mark" (só o símbolo) */
  variant?: LogoVariant;
  /** Altura do símbolo em px */
  size?: number;
  /** Símbolo e acento em currentColor (anel teal fica a opacity .45) */
  mono?: boolean;
  className?: string;
  style?: CSSProperties;
}

// A trama (o anel âmbar por cima) só é legível a partir de 28px — abaixo
// disso o traço engrossa e o arco de cruzamento é removido.
function getMarkParams(size: number) {
  if (size >= 40) return { r: 13, strokeWidth: 6, weave: true };
  if (size >= 28) return { r: 13, strokeWidth: 7, weave: true };
  if (size >= 20) return { r: 12.5, strokeWidth: 8, weave: false };
  return { r: 12, strokeWidth: 9, weave: false };
}

function LogoSymbol({ size, mono }: { size: number; mono?: boolean }) {
  // IDs de gradiente únicos por instância — vários logos podem coexistir
  // na mesma página e IDs fixos fariam o gradiente vazar entre SVGs.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const idA = `nosA${uid}`;
  const idB = `nosB${uid}`;
  const { r, strokeWidth, weave } = getMarkParams(size);
  const strokeA = mono ? 'currentColor' : `url(#${idA})`;
  const strokeB = mono ? 'currentColor' : `url(#${idB})`;

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      {!mono && (
        <defs>
          <linearGradient id={idA} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFB020" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
          <linearGradient id={idB} x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3EE0DD" />
            <stop offset="100%" stopColor="#17BEBB" />
          </linearGradient>
        </defs>
      )}
      <circle cx="24" cy="32" r={r} fill="none" stroke={strokeA} strokeWidth={strokeWidth} />
      <circle
        cx="40"
        cy="32"
        r={r}
        fill="none"
        stroke={strokeB}
        strokeWidth={strokeWidth}
        opacity={mono ? 0.45 : 1}
      />
      {weave && (
        <path
          d="M28.45 19.78 A13 13 0 0 1 34.78 24.73"
          fill="none"
          stroke={strokeA}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

function LogoWordmark({ mono }: { mono?: boolean }) {
  return (
    <span aria-hidden="true" className={`${styles.word} ${mono ? styles.wordMono : ''}`}>
      N<span className={styles.o}>o</span>s
    </span>
  );
}

export function Logo({ variant = 'lockup', size = 32, mono = false, className, style }: LogoProps) {
  if (variant === 'mark') {
    return (
      <span role="img" aria-label="Nós" className={`${styles.mark} ${className ?? ''}`} style={style}>
        <LogoSymbol size={size} mono={mono} />
      </span>
    );
  }

  const wordSize = size * 0.85;

  if (variant === 'vertical') {
    return (
      <span
        role="img"
        aria-label="Nós"
        className={`${styles.vertical} ${className ?? ''}`}
        style={{ ...style, fontSize: wordSize }}
      >
        <LogoSymbol size={size} mono={mono} />
        <LogoWordmark mono={mono} />
        <span className={styles.srOnly}>Nós</span>
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label="Nós"
      className={`${styles.lockup} ${className ?? ''}`}
      style={{ ...style, fontSize: wordSize }}
    >
      <LogoSymbol size={size} mono={mono} />
      <LogoWordmark mono={mono} />
      <span className={styles.srOnly}>Nós</span>
    </span>
  );
}
