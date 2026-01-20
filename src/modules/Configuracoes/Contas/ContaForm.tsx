import { useState, useEffect } from 'react';
import { Conta } from '@/types';
import './Contas.css';

interface ContaFormProps {
  conta?: Conta | null;
  onClose: () => void;
  onSave: (conta: Omit<Conta, 'id'> | Conta) => Promise<void>;
}

export function ContaForm({ conta, onClose, onSave }: ContaFormProps) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<Conta['tipo']>('corrente');
  const [saldo, setSaldo] = useState('');
  const [ativa, setAtiva] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!conta;

  useEffect(() => {
    if (conta) {
      setNome(conta.nome);
      setTipo(conta.tipo);
      setSaldo(conta.saldo.toString());
      setAtiva(conta.ativa);
    }
  }, [conta]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações
    if (!nome.trim()) {
      setError('Nome da conta é obrigatório');
      return;
    }

    const saldoNum = parseFloat(saldo);
    if (isNaN(saldoNum)) {
      setError('Saldo deve ser um número válido');
      return;
    }

    try {
      setLoading(true);
      
      const contaData: Omit<Conta, 'id'> | Conta = isEditMode && conta
        ? { ...conta, nome: nome.trim(), tipo, saldo: saldoNum, ativa }
        : {
            nome: nome.trim(),
            tipo,
            saldo: saldoNum,
            ativa,
            casalId: 'default', // Por enquanto fixo
          };

      await onSave(contaData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {isEditMode ? 'Editar Conta' : 'Nova Conta'}
          </h3>
          <button
            className="modal-close"
            onClick={handleClose}
            aria-label="Fechar"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="modal-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="nome" className="form-label">
              Nome da Conta *
            </label>
            <input
              id="nome"
              type="text"
              className="form-input"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: NuConta, Banco do Brasil"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tipo" className="form-label">
              Tipo *
            </label>
            <select
              id="tipo"
              className="form-select"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as Conta['tipo'])}
              required
              disabled={loading}
            >
              <option value="corrente">Conta Corrente</option>
              <option value="poupanca">Poupança</option>
              <option value="investimento">Investimento</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="saldo" className="form-label">
              Saldo Inicial *
            </label>
            <input
              id="saldo"
              type="number"
              step="0.01"
              className="form-input"
              value={saldo}
              onChange={(e) => setSaldo(e.target.value)}
              placeholder="0,00"
              required
              disabled={loading}
            />
          </div>

          {isEditMode && (
            <div className="form-group">
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={ativa}
                  onChange={(e) => setAtiva(e.target.checked)}
                  disabled={loading}
                />
                <span>Conta ativa</span>
              </label>
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : isEditMode ? 'Salvar' : 'Criar Conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}