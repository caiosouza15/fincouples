import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

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
        return {
          icon: AlertCircle,
          iconColor: 'text-negative',
          iconBg: 'bg-negative/10',
          confirmButtonClass: 'bg-negative text-white hover:bg-negative/90',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-warning',
          iconBg: 'bg-warning/10',
          confirmButtonClass: 'bg-warning text-white hover:bg-warning/90',
        };
      case 'info':
      default:
        return {
          icon: Info,
          iconColor: 'text-text-secondary',
          iconBg: 'bg-background',
          confirmButtonClass: 'bg-positive text-white hover:bg-positive/90',
        };
    }
  };

  const config = getVariantConfig();
  const IconComponent = config.icon;

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-md animate-[fadeIn_0.2s_ease]"
      onClick={onCancel}
    >
      <div
        className="bg-surface rounded-lg w-full max-w-[400px] shadow-lg animate-[slideUp_0.3s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-lg">
          <div className="flex items-start gap-md mb-md">
            <div className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-md ${config.iconBg}`}>
              <IconComponent size={24} className={config.iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-text-primary m-0 mb-xs">
                {title}
              </h3>
              <p className="text-sm text-text-secondary m-0">
                {message}
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row gap-md justify-end">
            <button
              type="button"
              className="py-sm px-md rounded-md text-sm font-medium cursor-pointer transition-all duration-200 border border-border bg-surface text-text-primary hover:bg-background"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={`py-sm px-md rounded-md text-sm font-medium cursor-pointer transition-all duration-200 border-none ${config.confirmButtonClass}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
