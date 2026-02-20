import { useState } from 'react';
import type { Conta } from '@/types';
import { formatCurrencyWithPrivacy } from '@/utils';
import { iconMap } from '@/utils/iconMap';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Pencil, Trash2, Copy } from 'lucide-react';

interface ContaItemProps {
  conta: Conta;
  hideSaldo?: boolean;
  onEdit: (conta: Conta) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (conta: Conta) => void;
}

export function ContaItem({ conta, hideSaldo = false, onEdit, onDelete, onDuplicate }: ContaItemProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const aplicarBlur = hideSaldo;
  
  const tipoLabels: Record<Conta['tipo'], string> = {
    corrente: 'Conta Corrente',
    poupanca: 'Poupança',
    investimento: 'Investimento',
  };

  const tipoIconNames: Record<Conta['tipo'], string> = {
    corrente: 'conta-corrente',
    poupanca: 'poupanca',
    investimento: 'investimento',
  };

  const getContaIcon = () => {
    if (conta.icone) {
      const IconComponent = iconMap[conta.icone];
      if (IconComponent) {
        return <IconComponent size={24} />;
      }
    }
    const defaultIconName = tipoIconNames[conta.tipo];
    const DefaultIcon = iconMap[defaultIconName];
    return DefaultIcon ? <DefaultIcon size={24} /> : null;
  };

  const handleConfirmDelete = () => {
    onDelete(conta.id);
    setShowConfirmDelete(false);
  };

  return (
    <div className={`flex md:flex-row flex-col md:items-center md:justify-between p-md bg-surface border border-border rounded-md transition-all duration-200 gap-md ${!conta.ativa ? 'opacity-60' : ''} hover:border-positive hover:shadow-sm`}>
      <div className="flex items-center gap-md flex-1 min-w-0 md:flex-row flex-col md:items-center">
        <div className="shrink-0 w-10 h-10 flex items-center justify-center bg-background rounded-md text-text-secondary">
          {getContaIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-xs mb-xs">
            <span className="text-base font-medium text-text-primary">{conta.nome}</span>
            {conta.nomeProprietario && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-background border border-border text-text-secondary">
                {conta.nomeProprietario}
              </span>
            )}
          </div>
          <div className="text-sm text-text-secondary">{tipoLabels[conta.tipo]}</div>
        </div>
        <div className={`text-lg font-semibold shrink-0 md:text-right ${conta.saldo >= 0 ? 'text-positive' : 'text-negative'} md:mt-0 mt-xs`}>
          {formatCurrencyWithPrivacy(conta.saldo, aplicarBlur)}
        </div>
      </div>
      <div className="flex gap-xs shrink-0 md:justify-start justify-end md:border-0 border-t border-border md:pt-0 pt-sm">
        {onDuplicate && (
          <button
            className="w-8 h-8 flex items-center justify-center bg-transparent border border-border rounded-sm cursor-pointer transition-all duration-200 p-0 hover:bg-background hover:border-text-muted"
            onClick={() => onDuplicate(conta)}
            aria-label="Duplicar conta"
            title="Duplicar conta"
          >
            <Copy size={16} />
          </button>
        )}
        <button
          className="w-8 h-8 flex items-center justify-center bg-transparent border border-border rounded-sm cursor-pointer transition-all duration-200 p-0 hover:bg-background hover:border-text-muted"
          onClick={() => onEdit(conta)}
          aria-label="Editar conta"
          title="Editar conta"
        >
          <Pencil size={16} />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center bg-transparent border border-border rounded-sm cursor-pointer transition-all duration-200 p-0 hover:bg-negative hover:border-negative group"
          onClick={() => setShowConfirmDelete(true)}
          aria-label="Excluir conta"
          title="Excluir conta"
        >
          <Trash2 size={16} className="text-text-secondary group-hover:text-white" />
        </button>
      </div>
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Excluir conta?"
        message={`Ao excluir a conta "${conta.nome}", o histórico de saldo será perdido. Deseja continuar?`}
        confirmText="Excluir"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmDelete(false)}
        variant="danger"
      />
    </div>
  );
}