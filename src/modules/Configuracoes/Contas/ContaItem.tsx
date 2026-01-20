import { Conta } from '@/types';
import { formatCurrency } from '@/utils';
import './Contas.css';

interface ContaItemProps {
  conta: Conta;
  onEdit: (conta: Conta) => void;
  onDelete: (id: string) => void;
  onToggleAtiva: (id: string) => void;
}

export function ContaItem({ conta, onEdit, onDelete, onToggleAtiva }: ContaItemProps) {
  const tipoLabels: Record<Conta['tipo'], string> = {
    corrente: 'Conta Corrente',
    poupanca: 'Poupança',
    investimento: 'Investimento',
  };

  const tipoIcons: Record<Conta['tipo'], string> = {
    corrente: '🏦',
    poupanca: '💰',
    investimento: '📈',
  };

  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja excluir a conta "${conta.nome}"?`)) {
      onDelete(conta.id);
    }
  };

  return (
    <div className={`conta-item ${!conta.ativa ? 'conta-item-inativa' : ''}`}>
      <div className="conta-item-content">
        <div className="conta-item-icon">{conta.icone || tipoIcons[conta.tipo]}</div>
        <div className="conta-item-info">
          <div className="conta-item-nome">{conta.nome}</div>
          <div className="conta-item-tipo">{tipoLabels[conta.tipo]}</div>
        </div>
        <div className={`conta-item-saldo ${conta.saldo >= 0 ? 'positivo' : 'negativo'}`}>
          {formatCurrency(conta.saldo)}
        </div>
      </div>
      <div className="conta-item-actions">
        <button
          className="conta-item-btn"
          onClick={() => onToggleAtiva(conta.id)}
          aria-label={conta.ativa ? 'Desativar conta' : 'Ativar conta'}
          title={conta.ativa ? 'Desativar conta' : 'Ativar conta'}
        >
          {conta.ativa ? '👁️' : '👁️‍🗨️'}
        </button>
        <button
          className="conta-item-btn"
          onClick={() => onEdit(conta)}
          aria-label="Editar conta"
          title="Editar conta"
        >
          ✏️
        </button>
        <button
          className="conta-item-btn conta-item-btn-danger"
          onClick={handleDelete}
          aria-label="Excluir conta"
          title="Excluir conta"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}