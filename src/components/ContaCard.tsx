import { useState } from 'react';
import { Wallet, Edit2, Trash2, Power, Copy } from 'lucide-react';
import type { Conta } from '@/types';
import { formatCurrencyWithPrivacy } from '@/utils';
import { iconMap } from '@/utils/iconMap';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useCasal } from '@/hooks/useCasal';

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

interface ContaCardProps {
  conta: Conta;
  hideSaldo?: boolean;
  onEdit: (conta: Conta) => void;
  onDelete: (id: string) => void;
  onToggleAtiva: (id: string) => void;
  onDuplicate?: (conta: Conta) => void;
}

export function ContaCard({
  conta,
  hideSaldo = false,
  onEdit,
  onDelete,
  onToggleAtiva,
  onDuplicate,
}: ContaCardProps) {
  const { getNomePessoa } = useCasal();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const getContaIcon = () => {
    if (conta.icone) {
      const IconComponent = iconMap[conta.icone];
      if (IconComponent) return <IconComponent size={24} />;
    }
    const defaultIconName = tipoIconNames[conta.tipo];
    const DefaultIcon = iconMap[defaultIconName];
    return DefaultIcon ? <DefaultIcon size={24} /> : <Wallet size={24} />;
  };

  const nomeProprietario = conta.proprietarioId
    ? (conta.nomeProprietario || getNomePessoa(conta.proprietarioId))
    : null;

  const handleDelete = () => {
    onDelete(conta.id);
    setShowConfirmDelete(false);
  };

  return (
    <>
      <div className={`relative group animate-[fadeIn_0.3s_ease] rounded-lg p-lg border-2 transition-all duration-300 hover:shadow-lg ${
        conta.ativa
          ? 'bg-surface border-border hover:border-positive/30'
          : 'bg-surface border-border opacity-60'
      }`}>
        <div className="absolute top-md right-md flex gap-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          {onDuplicate && (
            <button
              onClick={() => onDuplicate(conta)}
              className="w-8 h-8 flex items-center justify-center bg-background rounded-md text-text-secondary hover:text-positive hover:bg-surface transition-colors"
              aria-label="Duplicar conta"
              title="Duplicar conta"
            >
              <Copy size={16} />
            </button>
          )}
          <button
            onClick={() => onEdit(conta)}
            className="w-8 h-8 flex items-center justify-center bg-background rounded-md text-text-secondary hover:text-positive transition-colors"
            aria-label="Editar conta"
            title="Editar conta"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onToggleAtiva(conta.id)}
            className={`w-8 h-8 flex items-center justify-center bg-background rounded-md transition-colors ${
              conta.ativa ? 'text-warning hover:text-negative' : 'text-text-secondary hover:text-positive'
            }`}
            aria-label={conta.ativa ? 'Desativar conta' : 'Ativar conta'}
            title={conta.ativa ? 'Desativar conta' : 'Ativar conta'}
          >
            <Power size={16} />
          </button>
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="w-8 h-8 flex items-center justify-center bg-background rounded-md text-text-secondary hover:text-negative transition-colors"
            aria-label="Excluir conta"
            title="Excluir conta"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-md">
          <div className="flex items-start gap-sm">
            <div className="w-10 h-10 flex items-center justify-center bg-background rounded-md shrink-0 text-text-secondary">
              {getContaIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-text-primary m-0 mb-xs">{conta.nome}</h3>
              <p className="text-sm text-text-secondary m-0 mb-xs">{tipoLabels[conta.tipo]}</p>
              <div className="flex flex-wrap gap-xs">
                {nomeProprietario && (
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    conta.proprietarioId === 'usuario1' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {nomeProprietario}
                  </span>
                )}
                {!conta.ativa && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-warning/20 text-warning">
                    Inativa
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-sm border-t border-border">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Saldo</span>
              <span className={`text-xl font-bold ${conta.saldo >= 0 ? 'text-positive' : 'text-negative'}`}>
                {formatCurrencyWithPrivacy(conta.saldo, hideSaldo)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Excluir conta?"
        message={`Ao excluir a conta "${conta.nome}", o histórico de saldo será perdido. Deseja continuar?`}
        confirmText="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirmDelete(false)}
        variant="danger"
      />
    </>
  );
}
