import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useLancamentos } from '@/hooks/useLancamentos';
import { useSelectedMonth } from '@/contexts/SelectedMonthContext';
import type { Lancamento } from '@/types';
import { LancamentosList } from './LancamentosList';
import { LancamentoForm } from './LancamentoForm';

const Lancamentos = () => {
  const { selectedMonth } = useSelectedMonth();
  const { lancamentos, addLancamento, editLancamento, removeLancamento } = useLancamentos();
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
        } else {
          // Criar lançamento único
          await addLancamento(lancamentoData);
        }
      }
      setShowForm(false);
      setLancamentoEditando(null);
      setTipoPreSelecionado(undefined);
    } catch (error) {
      console.error('Erro ao salvar lançamento:', error);
      throw error;
    }
  };

  const handleDeleteLancamento = async (id: string) => {
    try {
      await removeLancamento(id);
    } catch (error) {
      console.error('Erro ao excluir lançamento:', error);
    }
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-md mb-lg">
        <h1 className="text-2xl font-bold text-text-primary">Lançamentos</h1>
        <div className="flex gap-md">
          <button
            className="flex items-center gap-sm bg-negative text-white border-none py-sm px-md rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-[#dc2626]"
            onClick={() => handleAddLancamento('despesa')}
          >
            <Plus size={18} />
            Nova Despesa
          </button>
          <button
            className="flex items-center gap-sm bg-positive text-white border-none py-sm px-md rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-[#16a34a]"
            onClick={() => handleAddLancamento('receita')}
          >
            <Plus size={18} />
            Nova Receita
          </button>
        </div>
      </div>

      <LancamentosList
        lancamentos={lancamentos}
        onEdit={handleEditLancamento}
        onDelete={handleDeleteLancamento}
        onTogglePago={handleTogglePago}
      />

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
