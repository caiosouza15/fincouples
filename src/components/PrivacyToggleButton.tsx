import { Eye, EyeOff } from 'lucide-react';
import { useSectionPrivacy } from '@/hooks/usePrivacy';

interface PrivacyToggleButtonProps {
  sectionKey: string;
}

export function PrivacyToggleButton({ sectionKey }: PrivacyToggleButtonProps) {
  const { hidden, toggle } = useSectionPrivacy(sectionKey);

  return (
    <button
      onClick={toggle}
      className="bg-transparent border-none cursor-pointer p-xs opacity-70 transition-opacity duration-200 text-text-secondary hover:opacity-100 hover:text-text-primary"
      aria-label={hidden ? 'Mostrar valores' : 'Ocultar valores'}
      title={hidden ? 'Mostrar valores' : 'Ocultar valores'}
    >
      {hidden ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  );
}
