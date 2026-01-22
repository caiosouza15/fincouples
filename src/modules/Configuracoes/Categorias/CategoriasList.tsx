import type { Categoria } from '@/types';
import { CategoriaItem } from './CategoriaItem';

type FiltroTipo = 'todas' | 'receita' | 'despesa';

interface CategoriasListProps {
  categorias: Categoria[];
  filtroTipo: FiltroTipo;
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

  const receitas = categoriasFiltradas.filter((c) => c.tipo === 'receita');
  const despesas = categoriasFiltradas.filter((c) => c.tipo === 'despesa');

  if (categorias.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-md">
      {receitas.length > 0 && (
        <div className="flex flex-col gap-sm">
          <div className="text-sm font-semibold text-text-secondary uppercase mb-xs py-xs">
            Receitas
          </div>
          {receitas.map((c) => (
            <CategoriaItem
              key={c.id}
              categoria={c}
              onEdit={onEdit}
              onDelete={onDelete}
              canDelete={!isPadrao(c.id)}
            />
          ))}
        </div>
      )}

      {despesas.length > 0 && (
        <div className="flex flex-col gap-sm">
          <div className="text-sm font-semibold text-text-secondary uppercase mb-xs py-xs">
            Despesas
          </div>
          {despesas.map((c) => (
            <CategoriaItem
              key={c.id}
              categoria={c}
              onEdit={onEdit}
              onDelete={onDelete}
              canDelete={!isPadrao(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
