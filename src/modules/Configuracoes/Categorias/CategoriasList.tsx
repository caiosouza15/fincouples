import type { Categoria } from '@/types';
import { CategoriaItem } from './CategoriaItem';

interface CategoriasListProps {
  categorias: Categoria[];
  filtroTipo: 'todas' | 'receita' | 'despesa';
  onEdit: (categoria: Categoria) => void;
  onDelete: (id: string) => void;
  isPadrao: (id: string) => boolean;
}

export function CategoriasList({
  categorias,
  filtroTipo,
  onEdit,
  onDelete,
  isPadrao,
}: CategoriasListProps) {
  const categoriasFiltradas =
    filtroTipo === 'todas'
      ? categorias
      : categorias.filter((c) => c.tipo === filtroTipo);

  if (categoriasFiltradas.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-sm">
      {categoriasFiltradas.map((categoria) => (
        <CategoriaItem
          key={categoria.id}
          categoria={categoria}
          onEdit={onEdit}
          onDelete={onDelete}
          isPadrao={isPadrao}
        />
      ))}
    </div>
  );
}
