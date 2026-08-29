import { Eye, EyeOff } from 'lucide-react';
import { useSectionPrivacy } from '@/hooks/usePrivacy';
import styles from './PrivacyToggleButton.module.css';

interface PrivacyToggleButtonProps {
  sectionKey: string;
}

export function PrivacyToggleButton({ sectionKey }: PrivacyToggleButtonProps) {
  const { hidden, toggle } = useSectionPrivacy(sectionKey);

  return (
    <button
      onClick={toggle}
      className={styles.btn}
      aria-label={hidden ? 'Mostrar valores' : 'Ocultar valores'}
      title={hidden ? 'Mostrar valores' : 'Ocultar valores'}
    >
      {hidden ? <EyeOff size={17} /> : <Eye size={17} />}
    </button>
  );
}
