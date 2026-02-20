import type { Lancamento } from '@/types';
import { formatCurrency } from '@/utils';
import { iconMap } from '@/utils/iconMap';
import { useCategorias } from '@/hooks/useCategorias';
import { useContas } from '@/hooks/useContas';
import { useCasal } from '@/hooks/useCasal';
import { Pencil, Trash2, CheckCircle2, Circle } from 'lucide-react';

interface LancamentoItemProps {
  lancamento: Lancamento;
  onEdit: (lancamento: Lancamento) => void;
  onDelete: (id: string) => void;
  onTogglePago: (id: string) => void;
}

export function LancamentoItem({
  lancamento,
  onEdit,
  onDelete,
  onTogglePago,
}: LancamentoItemProps) {
  const { categorias } = useCategorias();
  const { contas } = useContas();
  const { getNomePessoa } = useCasal();

  const categoria = categorias.find((c) => c.id === lancamento.categoriaId);
  const conta = lancamento.contaId
    ? contas.find((c) => c.id === lancamento.contaId)
    : null;
  
  const nomePessoa = lancamento.pessoaId 
    ? (lancamento.nomePessoa || getNomePessoa(lancamento.pessoaId))
    : null;

  const getCategoriaIcon = () => {
    if (categoria?.icone) {
      const IconComponent = iconMap[categoria.icone];
      if (IconComponent) {
        return <IconComponent size={20} />;
      }
    }
    return null;
  };

  const formatDate = (date: Date): string => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Hoje';
    }
    if (d.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    }

    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja excluir este lançamento?`)) {
      onDelete(lancamento.id);
    }
  };

  const isReceita = lancamento.tipo === 'receita';
  const valorColor = isReceita ? 'text-positive' : 'text-negative';
  const valorPrefix = isReceita ? '+' : '-';

  return (
    <div
      className={`flex md:flex-row flex-col md:items-center md:justify-between p-md bg-surface border border-border rounded-md transition-all duration-200 gap-md ${
        !lancamento.pago ? 'opacity-75' : ''
      } hover:border-positive hover:shadow-sm`}
    >
      <div className="flex items-center gap-md flex-1 min-w-0 md:flex-row flex-col md:items-center">
        <div
          className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-md ${
            isReceita ? 'bg-positive/10' : 'bg-negative/10'
          }`}
        >
          {getCategoriaIcon() || (
            <span className="text-text-secondary">{isReceita ? '💰' : '💸'}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-sm mb-xs flex-wrap">
            <div className="font-medium text-text-primary">{categoria?.nome || 'Sem categoria'}</div>
            {nomePessoa && lancamento.tipo === 'despesa' && (
              <span className={`px-xs py-0.5 text-xs font-medium rounded-full ${
                lancamento.pessoaId === 'usuario1'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {nomePessoa}
              </span>
            )}
            {!lancamento.pago && (
              <span className="text-xs px-sm py-xs bg-negative/10 text-negative rounded-sm">
                Pendente
              </span>
            )}
          </div>
          <div className="text-sm text-text-secondary">
            {lancamento.descricao || 'Sem descrição'}
          </div>
          <div className="text-xs text-text-muted mt-xs">
            {formatDate(lancamento.data)} • {conta?.nome || 'Sem conta'}
          </div>
        </div>

        <div className={`text-lg font-semibold shrink-0 md:text-right ${valorColor} md:mt-0 mt-xs`}>
          {valorPrefix} {formatCurrency(lancamento.valor)}
        </div>
      </div>

      <div className="flex gap-xs shrink-0 md:justify-start justify-end md:border-0 border-t border-border md:pt-0 pt-sm">
        <button
          className="w-8 h-8 flex items-center justify-center bg-transparent border border-border rounded-sm cursor-pointer transition-all duration-200 p-0 hover:bg-background hover:border-text-muted"
          onClick={() => onTogglePago(lancamento.id)}
          aria-label={lancamento.pago ? 'Marcar como pendente' : 'Marcar como pago'}
          title={lancamento.pago ? 'Marcar como pendente' : 'Marcar como pago'}
        >
          {lancamento.pago ? (
            <CheckCircle2 size={16} className="text-positive" />
          ) : (
            <Circle size={16} className="text-text-muted" />
          )}
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center bg-transparent border border-border rounded-sm cursor-pointer transition-all duration-200 p-0 hover:bg-background hover:border-text-muted"
          onClick={() => onEdit(lancamento)}
          aria-label="Editar lançamento"
          title="Editar lançamento"
        >
          <Pencil size={16} />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center bg-transparent border border-border rounded-sm cursor-pointer transition-all duration-200 p-0 hover:bg-negative hover:border-negative group"
          onClick={handleDelete}
          aria-label="Excluir lançamento"
          title="Excluir lançamento"
        >
          <Trash2 size={16} className="text-text-secondary group-hover:text-white" />
        </button>
      </div>
    </div>
  );
}
