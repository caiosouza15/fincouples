import { Logo } from '@/components/Logo';
import styles from './Splash.module.css';

interface SplashProps {
  status?: string;
}

export function Splash({ status }: SplashProps) {
  return (
    <div className={styles.splash}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <span className={styles.logo}>
        <Logo size={52} />
      </span>
      {status && <span className={styles.status}>{status}</span>}
    </div>
  );
}
