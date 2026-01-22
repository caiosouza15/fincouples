import type { Categoria } from '@/types';

interface CategoriaItemProps {
  categoria: Categoria;
  onEdit: (categoria: Categoria) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}

export function CategoriaItem({ categoria, onEdit, onDelete, canDelete }: CategoriaItemProps) {
  const tipoLabel = categoria.tipo === 'receita' ? 'Receita' : 'Despesa';
  const tipoBadgeClass =
    categoria.tipo === 'receita'
      ? 'bg-positive/15 text-positive'
      : 'bg-negative/15 text-negative';

  const handleDelete = () => {
    if (!canDelete) return;
    if (window.confirm(`Tem certeza que deseja excluir a categoria "${categoria.nome}"?`)) {
      onDelete(categoria.id);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between p-md bg-surface border border-border rounded-md transition-all duration-200 gap-md hover:border-positive hover:shadow-sm">
      <div className="flex items-center gap-md flex-1 min-w-0">
        <div
          className="text-xl shrink-0 w-10 h-10 flex items-center justify-center rounded-md"
          style={{ backgroundColor: categoria.cor ? `${categoria.cor}20` : '#f1f5f9' }}
        >
          {categoria.icone || (categoria.tipo === 'receita' ? '💰' : '📋')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-medium text-text-primary mb-xs">{categoria.nome}</div>
          <span
            className={`inline-block px-sm py-xs rounded text-xs font-medium ${tipoBadgeClass}`}
          >
            {tipoLabel}
          </span>
        </div>
      </div>
      <div className="flex gap-xs shrink-0 md:border-0 border-t border-border md:pt-0 pt-sm">
        <button
          className="w-8 h-8 flex items-center justify-center bg-transparent border border-border rounded-sm cursor-pointer text-base transition-all duration-200 p-0 hover:bg-background hover:border-text-muted"
          onClick={() => onEdit(categoria)}
          aria-label="Editar categoria"
          title="Editar categoria"
        >
          ✏️
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center bg-transparent border border-border rounded-sm cursor-pointer text-base transition-all duration-200 p-0 hover:bg-background hover:border-text-muted disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-border"
          onClick={handleDelete}
          disabled={!canDelete}
          aria-label={canDelete ? 'Excluir categoria' : 'Categoria padrão não pode ser excluída'}
          title={canDelete ? 'Excluir categoria' : 'Categoria padrão não pode ser excluída'}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
