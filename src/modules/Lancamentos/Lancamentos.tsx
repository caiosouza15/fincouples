import { useState } from 'react';
import { Plus, Receipt } from 'lucide-react';
import { useLancamentos } from '@/hooks/useLancamentos';
import { useSelectedMonth } from '@/contexts/SelectedMonthContext';
import { useToast } from '@/hooks/useToast';
import type { Lancamento } from '@/types';
import { LancamentosList } from './LancamentosList';
import { LancamentoForm } from './LancamentoForm';
import { ResumoLancamentos } from './ResumoLancamentos';
import styles from './Lancamentos.module.css';

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
        await editLancamento(lancamentoData.id, lancamentoData);
      } else {
        if (lancamentoData.parcelado && lancamentoData.totalParcelas && lancamentoData.totalParcelas > 1) {
          const valorParcela = lancamentoData.valor / lancamentoData.totalParcelas;
          const dataInicial = lancamentoData.data instanceof Date ? lancamentoData.data : new Date(lancamentoData.data);

          const primeiraParcela = await addLancamento({
            ...lancamentoData,
            valor: valorParcela,
            parcelaAtual: 1,
            lancamentoPaiId: undefined,
          });

          const lancamentoPaiId = primeiraParcela.id;
          await editLancamento(primeiraParcela.id, { lancamentoPaiId: primeiraParcela.id });

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
    <div className={styles.page}>
      {lancamentos.length > 0 && <ResumoLancamentos lancamentos={lancamentos} mesRef={selectedMonth} />}

      {lancamentos.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}><Receipt size={26} /></div>
          <div>
            <div className={styles.emptyStateTitle}>Nenhum lançamento cadastrado</div>
            <div className={styles.emptyStateMessage}>Adicione receitas e despesas para acompanhar seu fluxo.</div>
          </div>
          <div className={styles.emptyStateActions}>
            <button className={`${styles.addBtn} ${styles.addBtnDespesa}`} onClick={() => handleAddLancamento('despesa')}>
              Nova despesa
            </button>
            <button className={`${styles.addBtn} ${styles.addBtnReceita}`} onClick={() => handleAddLancamento('receita')}>
              Nova receita
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.headerActions}>
            <button className={`${styles.addBtn} ${styles.addBtnDespesa}`} onClick={() => handleAddLancamento('despesa')} aria-label="Nova despesa">
              <Plus size={17} />
              <span>Nova Despesa</span>
            </button>
            <button className={`${styles.addBtn} ${styles.addBtnReceita}`} onClick={() => handleAddLancamento('receita')} aria-label="Nova receita">
              <Plus size={17} />
              <span>Nova Receita</span>
            </button>
          </div>

          <LancamentosList
            lancamentos={lancamentos}
            onEdit={handleEditLancamento}
            onDelete={handleDeleteLancamento}
            onTogglePago={handleTogglePago}
            onDuplicate={handleDuplicateLancamento}
          />
        </>
      )}

      {showForm && (
        <LancamentoForm
          lancamento={lancamentoEditando}
          tipoPreSelecionado={tipoPreSelecionado}
          mesPreSelecionado={selectedMonth}
          onClose={handleCloseForm}
          onSave={handleSaveLancamento}
        />
      )}

      <button className={styles.floatingBtn} onClick={() => handleAddLancamento()} aria-label="Novo lançamento">
        <Plus size={24} />
      </button>
    </div>
  );
};

export default Lancamentos;
