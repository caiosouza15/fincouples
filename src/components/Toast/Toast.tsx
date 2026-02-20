import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import type { Toast as ToastType } from '@/contexts/ToastContext';

interface ToastProps {
  toast: ToastType;
  onClose: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={20} className="text-positive" />;
      case 'error':
        return <AlertCircle size={20} className="text-negative" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-warning" />;
      case 'info':
      default:
        return <Info size={20} className="text-text-secondary" />;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-positive/10 border-positive/30';
      case 'error':
        return 'bg-negative/10 border-negative/30';
      case 'warning':
        return 'bg-warning/10 border-warning/30';
      case 'info':
      default:
        return 'bg-surface border-border';
    }
  };

  return (
    <div
      className={`flex items-center gap-sm p-md rounded-md border shadow-lg min-w-[300px] max-w-[500px] animate-[slideInRight_0.3s_ease] ${getBgColor()}`}
      role="alert"
    >
      <div className="shrink-0">{getIcon()}</div>
      <p className="flex-1 text-sm text-text-primary m-0">{toast.message}</p>
      <button
        onClick={onClose}
        className="shrink-0 w-6 h-6 flex items-center justify-center bg-transparent border-none rounded-sm cursor-pointer text-text-secondary hover:text-text-primary transition-colors duration-200"
        aria-label="Fechar notificação"
      >
        <X size={16} />
      </button>
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
