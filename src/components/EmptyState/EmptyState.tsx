import { type ReactNode } from 'react';
import { CreditCard } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionButton?: ReactNode;
  hideText?: boolean;
}

export const EmptyState = ({ 
  title = "Nenhum item adicionado!", 
  message = "Que tal começar adicionando algo?",
  actionButton,
  hideText = false
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-xl px-md text-center">
      {!hideText && (
        <>
          <div className="w-16 h-16 flex items-center justify-center bg-background rounded-full mb-md">
            <CreditCard size={32} className="text-text-secondary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-sm">
            {title}
          </h3>
          <p className="text-text-secondary mb-md max-w-md">
            {message}
          </p>
        </>
      )}
      {hideText && actionButton && (
        <>
          <div className="w-16 h-16 flex items-center justify-center bg-background rounded-full mb-md">
            <CreditCard size={32} className="text-text-secondary" />
          </div>
          <p className="text-text-secondary mb-md max-w-md">
            Nenhum dado encontrado. Clique no botão abaixo para adicionar.
          </p>
        </>
      )}
      {actionButton && (
        <div className="mt-sm">
          {actionButton}
        </div>
      )}
    </div>
  );
};
