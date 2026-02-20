import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { useLancamentos } from '@/hooks/useLancamentos';
import { useSelectedMonth } from '@/contexts/SelectedMonthContext';
import { useToast } from '@/hooks/useToast';
import type { Lancamento } from '@/types';
import { LancamentosList } from './LancamentosList';
import { LancamentoForm } from './LancamentoForm';
import { ResumoLancamentos } from './ResumoLancamentos';
import { Receipt } from 'lucide-react';

const Lancamentos = () => {
  const { selectedMonth } = useSelectedMonth();
  const { lancamentos, addLancamento, editLancamento, removeLancamento } = useLancamentos();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [lancamentoEditando, setLancamentoEditando] = useState<Lancamento | null>(null);
  const [tipoPreSelecionado, setTipoPreSelecionado] = useState<'receita' | 'despesa' | undefined>();

  const handleAddLancamento = (tipo?: 'receita' | 'despesa') => {
    setLancamentoEditando(null);
    setTipoPreSelecionado(tipo);
    setShowForm(true);
  };

  const handleEditLancamento = (lancamento: Lancamento) => {
    setLancamentoEditando(lancamento);
    setTipoPreSelecionado(undefined);
    setShowForm(true);
  };

  const handleSaveLancamento = async (lancamentoData: Omit<Lancamento, 'id'> | Lancamento) => {
    try {
      if ('id' in lancamentoData) {
        // Edição: apenas atualizar o lançamento
        await editLancamento(lancamentoData.id, lancamentoData);
      } else {
        // Criação: verificar se é parcelado
        if (lancamentoData.parcelado && lancamentoData.totalParcelas && lancamentoData.totalParcelas > 1) {
          // Criar múltiplos lançamentos (parcelas)
          const valorParcela = lancamentoData.valor / lancamentoData.totalParcelas;
          const dataInicial = lancamentoData.data instanceof Date ? lancamentoData.data : new Date(lancamentoData.data);
          
          // Criar primeira parcela
          const primeiraParcela = await addLancamento({
            ...lancamentoData,
            valor: valorParcela,
            parcelaAtual: 1,
            lancamentoPaiId: undefined, // Será definido após criar
          });
          
          const lancamentoPaiId = primeiraParcela.id;
          
          // Atualizar primeira parcela com o ID pai
          await editLancamento(primeiraParcela.id, { lancamentoPaiId: primeiraParcela.id });
          
          // Criar parcelas seguintes
          for (let i = 2; i <= lancamentoData.totalParcelas; i++) {
            const dataParcela = new Date(dataInicial);
            dataParcela.setMonth(dataParcela.getMonth() + (i - 1));
            
            await addLancamento({
              ...lancamentoData,
              valor: valorParcela,
              data: dataParcela,
              parcelaAtual: i,
              lancamentoPaiId: lancamentoPaiId,
              descricao: `${lancamentoData.descricao} - Parcela ${i} de ${lancamentoData.totalParcelas}`,
            });
          }
          showToast('Lançamento parcelado salvo com sucesso', 'success');
        } else {
          const novoLancamento = await addLancamento(lancamentoData);
          showToast('Lançamento salvo com sucesso', 'success');
          setShowForm(false);
          setLancamentoEditando(null);
          setTipoPreSelecionado(undefined);
          setTimeout(() => {
            const el = document.getElementById(`lancamento-${novoLancamento.id}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.classList.add('animate-pulse');
              setTimeout(() => el.classList.remove('animate-pulse'), 3000);
            }
          }, 300);
          return;
        }
      }
      showToast('Lançamento atualizado com sucesso', 'success');
      setShowForm(false);
      setLancamentoEditando(null);
      setTipoPreSelecionado(undefined);
    } catch (error) {
      showToast('Erro ao salvar lançamento', 'error');
      throw error;
    }
  };

  const handleDeleteLancamento = async (id: string) => {
    try {
      await removeLancamento(id);
      showToast('Lançamento excluído com sucesso', 'success');
    } catch (error) {
      showToast('Erro ao excluir lançamento', 'error');
    }
  };

  const handleDuplicateLancamento = (lancamento: Lancamento) => {
    const dataObj = new Date(lancamento.data);
    const copia: Omit<Lancamento, 'id'> & { id?: string } = {
      ...lancamento,
      id: undefined,
      descricao: lancamento.descricao ? `${lancamento.descricao} (cópia)` : ' (cópia)',
      data: dataObj,
      casalId: lancamento.casalId,
    };
    delete copia.id;
    setLancamentoEditando(copia as Lancamento);
    setTipoPreSelecionado(undefined);
    setShowForm(true);
  };

  const handleTogglePago = async (id: string) => {
    const lancamento = lancamentos.find((l) => l.id === id);
    if (lancamento) {
      try {
        await editLancamento(id, { pago: !lancamento.pago });
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setLancamentoEditando(null);
    setTipoPreSelecionado(undefined);
  };

  return (
    <div className="max-w-[1280px] mx-auto pb-xl">
      <h1 className="text-2xl font-bold text-text-primary mb-lg">Lançamentos</h1>

      {lancamentos.length > 0 && (
        <div className="mb-lg">
          <ResumoLancamentos lancamentos={lancamentos} mesRef={selectedMonth} />
        </div>
      )}

      <Card
        title="Lançamentos"
        actions={
          <div className="flex items-center gap-sm">
            <button
              className="flex items-center justify-center gap-xs px-md py-sm rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 bg-negative text-white hover:bg-[#dc2626] shrink-0"
              onClick={() => handleAddLancamento('despesa')}
              aria-label="Nova despesa"
            >
              <Plus size={18} strokeWidth={2} className="shrink-0" />
              <span className="hidden md:inline">Nova Despesa</span>
            </button>
            <button
              className="flex items-center justify-center gap-xs px-md py-sm rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 bg-positive text-white hover:bg-[#16a34a] shrink-0"
              onClick={() => handleAddLancamento('receita')}
              aria-label="Nova receita"
            >
              <Plus size={18} strokeWidth={2} className="shrink-0" />
              <span className="hidden md:inline">Nova Receita</span>
            </button>
          </div>
        }
      >
        {lancamentos.length === 0 ? (
          <EmptyState
            icon={<Receipt size={32} className="text-text-secondary" />}
            title="Nenhum lançamento cadastrado"
            message="Adicione receitas e despesas para acompanhar seu fluxo."
            actionButton={
              <div className="flex flex-wrap gap-sm justify-center">
                <button
                  className="bg-negative text-white py-sm px-md rounded-md text-sm font-medium cursor-pointer hover:bg-[#dc2626]"
                  onClick={() => handleAddLancamento('despesa')}
                >
                  Nova despesa
                </button>
                <button
                  className="bg-positive text-white py-sm px-md rounded-md text-sm font-medium cursor-pointer hover:bg-[#16a34a]"
                  onClick={() => handleAddLancamento('receita')}
                >
                  Nova receita
                </button>
              </div>
            }
          />
        ) : (
          <LancamentosList
            lancamentos={lancamentos}
            onEdit={handleEditLancamento}
            onDelete={handleDeleteLancamento}
            onTogglePago={handleTogglePago}
            onDuplicate={handleDuplicateLancamento}
          />
        )}

      </Card>

      {showForm && (
        <LancamentoForm
          lancamento={lancamentoEditando}
          tipoPreSelecionado={tipoPreSelecionado}
          mesPreSelecionado={selectedMonth}
          onClose={handleCloseForm}
          onSave={handleSaveLancamento}
        />
      )}

      {/* Botão flutuante para mobile */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 bg-positive text-white rounded-full border-none cursor-pointer shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-[#16a34a] hover:scale-110 md:hidden z-50"
        onClick={() => handleAddLancamento()}
        aria-label="Novo lançamento"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default Lancamentos;
