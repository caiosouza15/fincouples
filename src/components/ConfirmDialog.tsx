import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'info',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getVariantConfig = () => {
    switch (variant) {
      case 'danger':
        return { icon: AlertCircle, iconClass: styles.iconDanger, buttonClass: styles.btnDanger };
      case 'warning':
        return { icon: AlertTriangle, iconClass: styles.iconWarning, buttonClass: styles.btnWarning };
      case 'info':
      default:
        return { icon: Info, iconClass: styles.iconInfo, buttonClass: styles.btnPrimary };
    }
  };

  const config = getVariantConfig();
  const IconComponent = config.icon;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.body}>
          <div className={styles.header}>
            <div className={`${styles.iconWrap} ${config.iconClass}`}>
              <IconComponent size={20} />
            </div>
            <div className={styles.textWrap}>
              <h3 className={styles.title}>{title}</h3>
              <p className={styles.message}>{message}</p>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.btnGhost} onClick={onCancel}>
              {cancelText}
            </button>
            <button type="button" className={config.buttonClass} onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
