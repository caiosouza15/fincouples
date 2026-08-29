import { useState } from 'react';
import type { Categoria } from '@/types';
import { iconMap } from '@/utils/iconMap';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Pencil, Trash2 } from 'lucide-react';

interface CategoriaItemProps {
  categoria: Categoria;
  onEdit: (categoria: Categoria) => void;
  onDelete: (id: string) => void;
  isPadrao: (id: string) => boolean;
}

export function CategoriaItem({ categoria, onEdit, onDelete, isPadrao }: CategoriaItemProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const padrao = isPadrao(categoria.id);

  const IconComponent = categoria.icone ? iconMap[categoria.icone] : null;

  const handleConfirmDelete = () => {
    onDelete(categoria.id);
    setShowConfirmDelete(false);
  };

  return (
    <div className="flex md:flex-row flex-col md:items-center md:justify-between p-md bg-surface border border-border rounded-md transition-all duration-200 gap-md hover:border-positive hover:shadow-sm">
      <div className="flex items-center gap-md flex-1 min-w-0">
        <div
          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-md"
          style={{ backgroundColor: categoria.cor ? `${categoria.cor}20` : undefined }}
        >
          {IconComponent ? (
            <IconComponent size={20} style={{ color: categoria.cor }} />
          ) : (
            <span className="text-sm font-medium" style={{ color: categoria.cor }}>
              {categoria.nome.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <div className="font-medium text-text-primary">{categoria.nome}</div>
          <div className="text-sm text-text-secondary capitalize">{categoria.tipo}</div>
        </div>
      </div>
      <div className="flex gap-xs shrink-0">
        <button
          className="w-8 h-8 flex items-center justify-center bg-transparent border border-border rounded-sm cursor-pointer transition-all duration-200 p-0 hover:bg-background hover:border-text-muted"
          onClick={() => onEdit(categoria)}
          aria-label="Editar categoria"
        >
          <Pencil size={16} />
        </button>
        {!padrao && (
          <button
            className="w-8 h-8 flex items-center justify-center bg-transparent border border-border rounded-sm cursor-pointer transition-all duration-200 p-0 hover:bg-negative hover:border-negative group"
            onClick={() => setShowConfirmDelete(true)}
            aria-label="Excluir categoria"
          >
            <Trash2 size={16} className="text-text-secondary group-hover:text-white" />
          </button>
        )}
      </div>
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Excluir categoria?"
        message={`Ao excluir "${categoria.nome}", os lançamentos que a usam ficarão sem categoria. Deseja continuar?`}
        confirmText="Excluir"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmDelete(false)}
        variant="danger"
      />
    </div>
  );
}
