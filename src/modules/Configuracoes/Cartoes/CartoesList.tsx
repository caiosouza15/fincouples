import type { CartaoCredito } from '@/types';
import { CartaoItem } from './CartaoItem';
import styles from './CartoesList.module.css';

interface CartoesListProps {
  cartoes: CartaoCredito[];
  hideValues?: boolean;
  onEdit: (cartao: CartaoCredito) => void;
  onDelete: (id: string) => void;
  onToggleAtivo: (id: string) => void;
}

export function CartoesList({
  cartoes,
  hideValues = false,
  onEdit,
  onDelete,
  onToggleAtivo,
}: CartoesListProps) {
  const cartoesAtivos = cartoes.filter((c) => c.ativo);
  const cartoesInativos = cartoes.filter((c) => !c.ativo);

  if (cartoes.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-md">
      {cartoesAtivos.length > 0 && (
        <div className="flex flex-col gap-sm">
          {cartoesAtivos.map((cartao) => (
            <CartaoItem
              key={cartao.id}
              cartao={cartao}
              hideValues={hideValues}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleAtivo={onToggleAtivo}
            />
          ))}
        </div>
      )}

      {cartoesInativos.length > 0 && (
        <div className="flex flex-col gap-sm">
          <div className={styles.sectionLabel}>Cartões Inativos</div>
          {cartoesInativos.map((cartao) => (
            <CartaoItem
              key={cartao.id}
              cartao={cartao}
              hideValues={hideValues}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleAtivo={onToggleAtivo}
            />
          ))}
        </div>
      )}
    </div>
  );
}
