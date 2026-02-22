import { useState } from 'react';
import { CreditCard, Edit2, Trash2, Power, Copy } from 'lucide-react';
import type { CartaoCredito } from '@/types';
import { formatCurrencyWithPrivacy } from '@/utils';
import { iconMap } from '@/utils/iconMap';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useCasal } from '@/hooks/useCasal';

interface CartaoCardProps {
  cartao: CartaoCredito;
  hideValues?: boolean;
  onEdit: (cartao: CartaoCredito) => void;
  onDelete: (id: string) => void;
  onToggleAtivo: (id: string) => void;
  onDuplicate?: (cartao: CartaoCredito) => void;
}

export function CartaoCard({
  cartao,
  hideValues = false,
  onEdit,
  onDelete,
  onToggleAtivo,
  onDuplicate,
}: CartaoCardProps) {
  const { getNomePessoa } = useCasal();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  const porcentagemUso = cartao.limite > 0 
    ? Math.min((cartao.faturaAtual / cartao.limite) * 100, 100)
    : 0;

  const IconComponent = cartao.icone ? iconMap[cartao.icone] : CreditCard;
  
  // Gerar número mascarado do cartão (últimos 4 dígitos)
  const numeroCartao = `**** **** **** ${cartao.id.slice(-4).padStart(4, '0')}`;
  
  // Obter nome do proprietário
  const nomeProprietario = cartao.proprietarioId 
    ? (cartao.nomeProprietario || getNomePessoa(cartao.proprietarioId))
    : null;

  const handleDelete = () => {
    onDelete(cartao.id);
    setShowConfirmDelete(false);
  };

  return (
    <>
    <div className="relative group animate-[fadeInUp_0.3s_ease]">
      <div
        className={`relative overflow-hidden rounded-lg p-lg transition-all duration-300 hover:shadow-md transition-shadow duration-200 ${
          cartao.ativo
            ? 'bg-gradient-to-br from-positive/20 via-positive/10 to-surface border-2 border-positive/30'
            : 'bg-gradient-to-br from-surface via-background to-surface border-2 border-border opacity-60'
        }`}
        style={{
          background: cartao.ativo
            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 50%, var(--surface) 100%)'
            : undefined,
        }}
      >
        {/* Overlay de ações no hover */}
        <div className="absolute top-md right-md flex gap-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          {onDuplicate && (
            <button
              onClick={() => onDuplicate(cartao)}
              className="w-8 h-8 flex items-center justify-center bg-surface/90 backdrop-blur-sm rounded-md text-text-secondary hover:text-positive hover:bg-surface transition-colors duration-200"
              aria-label="Duplicar cartão"
              title="Duplicar cartão"
            >
              <Copy size={16} />
            </button>
          )}
          <button
            onClick={() => onEdit(cartao)}
            className="w-8 h-8 flex items-center justify-center bg-surface/90 backdrop-blur-sm rounded-md text-text-secondary hover:text-positive hover:bg-surface transition-colors duration-200"
            aria-label="Editar cartão"
            title="Editar cartão"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onToggleAtivo(cartao.id)}
            className={`w-8 h-8 flex items-center justify-center bg-surface/90 backdrop-blur-sm rounded-md transition-colors duration-200 ${
              cartao.ativo
                ? 'text-warning hover:text-negative'
                : 'text-text-secondary hover:text-positive'
            }`}
            aria-label={cartao.ativo ? 'Desativar cartão' : 'Ativar cartão'}
            title={cartao.ativo ? 'Desativar cartão' : 'Ativar cartão'}
          >
            <Power size={16} />
          </button>
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="w-8 h-8 flex items-center justify-center bg-surface/90 backdrop-blur-sm rounded-md text-text-secondary hover:text-negative hover:bg-surface transition-colors duration-200"
            aria-label="Excluir cartão"
            title="Excluir cartão"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Conteúdo do cartão */}
        <div className="flex flex-col gap-md">
          {/* Header */}
          <div className="flex items-start justify-between gap-sm">
            <div className="flex items-start gap-sm flex-1 min-w-0">
              <div className="w-10 h-10 flex items-center justify-center bg-surface/50 rounded-md shrink-0">
                <IconComponent size={24} className="text-text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-text-primary m-0 mb-xs">
                  {cartao.nome}
                </h3>
                <p className="text-xs text-text-secondary m-0 font-mono mb-xs">
                  {numeroCartao}
                </p>
                <div className="flex items-center gap-xs flex-wrap">
                  {nomeProprietario && (
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full shrink-0 ${
                      cartao.proprietarioId === 'usuario1'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {nomeProprietario}
                    </span>
                  )}
                  {cartao.tipo && (
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-surface text-text-secondary border border-border shrink-0">
                      {cartao.tipo === 'principal' ? 'Principal' : 'Adicional'}
                    </span>
                  )}
                  {!cartao.ativo && (
                    <span className="px-xs py-0.5 text-xs font-semibold rounded-full bg-warning/20 text-warning shrink-0">
                      Inativo
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Informações principais */}
          <div className="flex flex-col gap-sm">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Limite</span>
              <span className="text-base font-semibold text-text-primary">
                {formatCurrencyWithPrivacy(cartao.limite, hideValues)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Disponível</span>
              <span className="text-base font-semibold text-positive">
                {formatCurrencyWithPrivacy(cartao.limiteDisponivel, hideValues)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Fatura Atual</span>
              <span className="text-base font-semibold text-negative">
                {formatCurrencyWithPrivacy(cartao.faturaAtual, hideValues)}
              </span>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="flex flex-col gap-xs">
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-secondary">Uso do limite</span>
              <span className="text-xs font-semibold text-text-primary">
                {hideValues ? '•••' : `${porcentagemUso.toFixed(0)}%`}
              </span>
            </div>
            <div className="w-full h-2 bg-background rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  porcentagemUso >= 90
                    ? 'bg-negative'
                    : porcentagemUso >= 70
                    ? 'bg-warning'
                    : 'bg-positive'
                }`}
                style={{ width: `${porcentagemUso}%` }}
              />
            </div>
          </div>

          {/* Informações de fechamento/vencimento */}
          <div className="flex justify-between items-center pt-sm border-t border-border/50">
            <div className="flex flex-col">
              <span className="text-xs text-text-secondary">Fechamento</span>
              <span className="text-sm font-medium text-text-primary">
                Dia {cartao.fechamento}
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xs text-text-secondary">Vencimento</span>
              <span className="text-sm font-medium text-text-primary">
                Dia {cartao.vencimento}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Excluir cartão"
        message={`Tem certeza que deseja excluir o cartão "${cartao.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirmDelete(false)}
      />
    </>
  );
}
