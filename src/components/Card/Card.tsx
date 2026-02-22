interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export const Card = ({ title, description, children, className = '', actions }: CardProps) => {
  return (
    <div className={`bg-surface border border-border rounded-lg p-4 sm:p-6 lg:p-lg mb-4 sm:mb-md shadow-sm min-w-0 ${className}`}>
      {(title || description || actions) && (
        <div className="mb-4 sm:mb-md">
          <div className="flex flex-wrap justify-between items-center gap-2">
            {title && <h3 className="text-base sm:text-lg font-semibold text-text-primary m-0 break-words">{title}</h3>}
            {actions && <div className="flex gap-sm items-center shrink-0">{actions}</div>}
          </div>
          {description && <p className="text-sm text-text-secondary mt-1 m-0 break-words">{description}</p>}
        </div>
      )}
      <div className="text-text-secondary min-w-0 overflow-hidden">{children}</div>
    </div>
  );
};
