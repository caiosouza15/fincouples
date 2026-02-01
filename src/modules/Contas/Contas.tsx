import { useState } from 'react';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { useContas } from '@/hooks/useContas';
import type { Conta } from '@/types';
import { ContasList } from '@/modules/Configuracoes/Contas/ContasList';
import { ContaForm } from '@/modules/Configuracoes/Contas/ContaForm';

const Contas = () => {
  const { contas, addConta, editConta, removeConta, toggleContaAtiva } = useContas();
  
  const [hidePoupancaInvestimento, setHidePoupancaInvestimento] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [contaEditando, setContaEditando] = useState<Conta | null>(null);

  const handleAddConta = () => {
    setContaEditando(null);
    setShowForm(true);
  };

  const handleEditConta = (conta: Conta) => {
    setContaEditando(conta);
    setShowForm(true);
  };

  const handleSaveConta = async (contaData: Omit<Conta, 'id'> | Conta) => {
    if ('id' in contaData) {
      await editConta(contaData.id, contaData);
    } else {
      await addConta(contaData);
    }
    setShowForm(false);
    setContaEditando(null);
  };

  const handleDeleteConta = async (id: string) => {
    await removeConta(id);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setContaEditando(null);
  };

  return (
    <div className="max-w-[1280px] mx-auto pb-xl">
      <h1 className="text-2xl font-bold text-text-primary mb-lg">Minhas Contas</h1>

      <Card
        title="Minhas contas"
        actions={
          <label className="flex items-center gap-sm text-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={hidePoupancaInvestimento}
              onChange={(e) => setHidePoupancaInvestimento(e.target.checked)}
            />
            <span className="text-xs">Esconder saldo das contas poupanças / investimentos</span>
          </label>
        }
      >
        {contas.length === 0 ? (
          <EmptyState 
            hideText={true}
            actionButton={
              <button
                className="bg-transparent text-text-primary border border-border py-sm px-md rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-background"
                onClick={handleAddConta}
              >
                Adicionar conta
              </button>
            }
          />
        ) : (
          <>
            <ContasList
              contas={contas}
              hidePoupancaInvestimento={hidePoupancaInvestimento}
              onEdit={handleEditConta}
              onDelete={handleDeleteConta}
              onToggleAtiva={toggleContaAtiva}
            />
            <div className="mt-md">
              <button
                className="bg-transparent text-text-primary border border-border py-sm px-md rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-background"
                onClick={handleAddConta}
              >
                + Adicionar conta
              </button>
            </div>
          </>
        )}
      </Card>

      {showForm && (
        <ContaForm
          conta={contaEditando}
          onClose={handleCloseForm}
          onSave={handleSaveConta}
        />
      )}
    </div>
  );
};

export default Contas;
