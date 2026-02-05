import type { CartaoCredito } from '@/types';
import { formatCurrencyWithPrivacy } from '@/utils';
import { usePrivacy } from '@/hooks/usePrivacy';
import { CreditCard, Power, Pencil, Trash2 } from 'lucide-react';

interface CartaoItemProps {
  cartao: CartaoCredito;
  onEdit: (cartao: CartaoCredito) => void;
  onDelete: (id: string) => void;
  onToggleAtivo: (id: string) => void;
}

export function CartaoItem({ cartao, onEdit, onDelete, onToggleAtivo }: CartaoItemProps) {
  const { valuesHidden } = usePrivacy();
  
  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja excluir o cartão "${cartao.nome}"?`)) {
      onDelete(cartao.id);
    }
  };

  const percentualUsado = cartao.limite > 0 
    ? ((cartao.limite - cartao.limiteDisponivel) / cartao.limite) * 100 
    : 0;

  return (
    <div className={`flex md:flex-row flex-col md:items-center md:justify-between p-md bg-surface border border-border rounded-md transition-all duration-200 gap-md ${!cartao.ativo ? 'opacity-60' : ''} hover:border-positive hover:shadow-sm`}>
      <div className="flex items-center gap-md flex-1 min-w-0 md:flex-row flex-col md:items-center">
        <div className="shrink-0 w-10 h-10 flex items-center justify-center bg-background rounded-md text-text-secondary">
          <CreditCard size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-medium text-text-primary mb-xs">{cartao.nome}</div>
          <div className="text-sm text-text-secondary">
            Limite: {formatCurrencyWithPrivacy(cartao.limite, valuesHidden)} • Disponível: {formatCurrencyWithPrivacy(cartao.limiteDisponivel, valuesHidden)}
          </div>
          <div className="text-xs text-text-secondary mt-xs">
            Fechamento: dia {cartao.fechamento} • Vencimento: dia {cartao.vencimento}
          </div>
          {cartao.faturaAtual > 0 && (
            <div className="text-sm text-negative mt-xs">
              Fatura atual: {formatCurrencyWithPrivacy(cartao.faturaAtual, valuesHidden)}
            </div>
          )}
          {percentualUsado > 0 && (
            <div className="mt-xs">
              <div className="w-full bg-background rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${percentualUsado > 80 ? 'bg-negative' : percentualUsado > 50 ? 'bg-warning' : 'bg-positive'}`}
                  style={{ width: `${Math.min(percentualUsado, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-xs shrink-0 md:justify-start justify-end md:border-0 border-t border-border md:pt-0 pt-sm">
        <button
          className={`w-8 h-8 flex items-center justify-center bg-transparent border border-border rounded-sm cursor-pointer transition-all duration-200 p-0 hover:bg-background hover:border-text-muted ${cartao.ativo ? '' : 'opacity-50'}`}
          onClick={() => onToggleAtivo(cartao.id)}
          aria-label={cartao.ativo ? 'Desativar cartão' : 'Ativar cartão'}
          title={cartao.ativo ? 'Desativar cartão' : 'Ativar cartão'}
        >
          <Power size={16} className={cartao.ativo ? 'text-positive' : 'text-text-secondary'} />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center bg-transparent border border-border rounded-sm cursor-pointer transition-all duration-200 p-0 hover:bg-background hover:border-text-muted"
          onClick={() => onEdit(cartao)}
          aria-label="Editar cartão"
          title="Editar cartão"
        >
          <Pencil size={16} />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center bg-transparent border border-border rounded-sm cursor-pointer transition-all duration-200 p-0 hover:bg-negative hover:border-negative group"
          onClick={handleDelete}
          aria-label="Excluir cartão"
          title="Excluir cartão"
        >
          <Trash2 size={16} className="text-text-secondary group-hover:text-white" />
        </button>
      </div>
    </div>
  );
}
