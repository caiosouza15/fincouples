interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export const Card = ({ title, children, className = '', actions }: CardProps) => {
  return (
    <div className={`bg-surface border border-border rounded-lg p-lg mb-md shadow-sm ${className}`}>
      {(title || actions) && (
        <div className="flex justify-between items-center mb-md">
          {title && <h3 className="text-lg font-semibold text-text-primary m-0">{title}</h3>}
          {actions && <div className="flex gap-sm items-center">{actions}</div>}
        </div>
      )}
      <div className="text-text-secondary">{children}</div>
    </div>
  );
};
