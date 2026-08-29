import { type ReactNode } from 'react';
import { Logo } from '@/components/Logo';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionButton?: ReactNode;
  hideText?: boolean;
  icon?: ReactNode;
}

export const EmptyState = ({
  title = "Nenhum item adicionado!",
  message = "Que tal começar adicionando algo?",
  actionButton,
  hideText = false,
  icon
}: EmptyStateProps) => {
  const IconSlot = icon ?? (
    <span aria-hidden="true" className="text-text-secondary opacity-25">
      <Logo variant="mark" size={48} mono />
    </span>
  );
  return (
    <div className="flex flex-col items-center justify-center py-xl px-md text-center">
      {!hideText && (
        <>
          <div className="w-16 h-16 flex items-center justify-center bg-background rounded-full mb-md">
            {IconSlot}
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
            {IconSlot}
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
