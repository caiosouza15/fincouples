import { useState, useMemo } from 'react';
import { Plus, Wallet, Search, ChevronDown, ArrowUpDown, LayoutGrid, List } from 'lucide-react';
import { useContas } from '@/hooks/useContas';
import { useSectionPrivacy } from '@/hooks/usePrivacy';
import { useToast } from '@/hooks/useToast';
import type { Conta } from '@/types';
import { ContasList } from '@/modules/Configuracoes/Contas/ContasList';
import { ContaForm } from '@/modules/Configuracoes/Contas/ContaForm';
import { ResumoContas } from '@/modules/Contas/ResumoContas';
import { useCasal } from '@/hooks/useCasal';
import { useAlertasSaldo } from '@/hooks/useAlertasSaldo';
import { AlertasSaldoCard } from '@/components/AlertasSaldoCard';
import { ContaCard } from '@/components/ContaCard';
import { PrivacyToggleButton } from '@/components/PrivacyToggleButton';
import styles from './Contas.module.css';

type FiltroStatus = 'todos' | 'ativos' | 'inativos';
type FiltroTipo = 'todos' | Conta['tipo'];
type FiltroProprietario = 'todos' | 'usuario1' | 'usuario2';
type OrdenacaoContas = 'nome' | 'saldo-maior' | 'saldo-menor' | 'tipo' | 'proprietario';

const Contas = () => {
  const { contas, addConta, editConta, removeConta, toggleContaAtiva } = useContas();
  const { hidden: hideContasValues } = useSectionPrivacy('minhas-contas');
  const { showToast } = useToast();
  const { usuario1Nome, usuario2Nome } = useCasal();
  const { alertas: alertasSaldo } = useAlertasSaldo();
  const [showForm, setShowForm] = useState(false);
  const [contaEditando, setContaEditando] = useState<Conta | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todos');
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos');
  const [filtroProprietario, setFiltroProprietario] = useState<FiltroProprietario>('todos');
  const [ordenacao, setOrdenacao] = useState<OrdenacaoContas>('nome');
  const [visualizacao, setVisualizacao] = useState<'lista' | 'cards'>('cards');

  const handleAddConta = () => {
    setContaEditando(null);
    setShowForm(true);
  };

  const handleEditConta = (conta: Conta) => {
    setContaEditando(conta);
    setShowForm(true);
  };

  const handleSaveConta = async (contaData: Omit<Conta, 'id'> | Conta) => {
    try {
      if ('id' in contaData) {
        await editConta(contaData.id, contaData);
        showToast('Conta atualizada com sucesso', 'success');
        setShowForm(false);
        setContaEditando(null);
      } else {
        const novoConta = await addConta(contaData);
        showToast('Conta adicionada com sucesso', 'success');
        setShowForm(false);
        setContaEditando(null);
        setTimeout(() => {
          const element = document.getElementById(`conta-${novoConta.id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('animate-pulse');
            setTimeout(() => element.classList.remove('animate-pulse'), 3000);
          }
        }, 300);
      }
    } catch (error) {
      showToast('Erro ao salvar conta', 'error');
      throw error;
    }
  };

  const handleDeleteConta = async (id: string) => {
    try {
      await removeConta(id);
      showToast('Conta excluída com sucesso', 'success');
    } catch (error) {
      showToast('Erro ao excluir conta', 'error');
    }
  };

  const handleDuplicateConta = (conta: Conta) => {
    const contaDuplicada: Conta = {
      ...conta,
      id: crypto.randomUUID(),
      nome: `${conta.nome} (cópia)`,
      saldo: 0,
    };
    setContaEditando(contaDuplicada);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setContaEditando(null);
  };

  const contasFiltradas = useMemo(() => {
    let filtrados = contas;

    if (filtroStatus === 'ativos') filtrados = filtrados.filter(c => c.ativa);
    else if (filtroStatus === 'inativos') filtrados = filtrados.filter(c => !c.ativa);

    if (filtroTipo !== 'todos') filtrados = filtrados.filter(c => c.tipo === filtroTipo);

    if (filtroProprietario !== 'todos') filtrados = filtrados.filter(c => c.proprietarioId === filtroProprietario);

    if (busca.trim()) {
      const q = busca.toLowerCase().trim();
      filtrados = filtrados.filter(c => c.nome.toLowerCase().includes(q));
    }

    filtrados = [...filtrados].sort((a, b) => {
      switch (ordenacao) {
        case 'nome':
          return a.nome.localeCompare(b.nome, 'pt-BR');
        case 'saldo-maior':
          return b.saldo - a.saldo;
        case 'saldo-menor':
          return a.saldo - b.saldo;
        case 'tipo':
          return a.tipo.localeCompare(b.tipo, 'pt-BR');
        case 'proprietario': {
          const na = (a.nomeProprietario ?? '').localeCompare(b.nomeProprietario ?? '', 'pt-BR');
          if (na !== 0) return na;
          return a.nome.localeCompare(b.nome, 'pt-BR');
        }
        default:
          return 0;
      }
    });

    return filtrados;
  }, [contas, busca, filtroStatus, filtroTipo, filtroProprietario, ordenacao]);

  const temFiltroAtivo = !!busca.trim() || filtroStatus !== 'todos' || filtroTipo !== 'todos' || filtroProprietario !== 'todos';

  return (
    <div className={styles.page}>
      {alertasSaldo.length > 0 && <AlertasSaldoCard alertas={alertasSaldo} hideSaldo={hideContasValues} />}
      {contas.length > 0 && <ResumoContas contas={contas} hideSaldo={hideContasValues} />}

      {contas.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}><Wallet size={26} /></div>
          <div>
            <div className={styles.emptyStateTitle}>Nenhuma conta cadastrada</div>
            <div className={styles.emptyStateMessage}>Adicione contas para acompanhar seus saldos.</div>
          </div>
          <button className={styles.emptyStateAction} onClick={handleAddConta}>Adicionar conta</button>
        </div>
      ) : (
        <>
          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon}><Search size={16} /></span>
              <input
                type="text"
                placeholder="Buscar conta..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.segmented} role="group" aria-label="Filtrar por status">
              {(['todos', 'ativos', 'inativos'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`${styles.segBtn} ${filtroStatus === status ? styles.segBtnActive : ''}`}
                  onClick={() => setFiltroStatus(status)}
                  aria-pressed={filtroStatus === status}
                >
                  {status === 'todos' ? 'Todos' : status === 'ativos' ? 'Ativos' : 'Inativos'}
                </button>
              ))}
            </div>

            <div className={styles.selectWrap}>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as FiltroTipo)}
                className={styles.select}
              >
                <option value="todos">Todos os tipos</option>
                <option value="corrente">Conta Corrente</option>
                <option value="poupanca">Poupança</option>
                <option value="investimento">Investimento</option>
              </select>
              <ChevronDown size={15} className={styles.selectChevron} />
            </div>

            <div className={styles.selectWrap}>
              <select
                value={filtroProprietario}
                onChange={(e) => setFiltroProprietario(e.target.value as FiltroProprietario)}
                className={styles.select}
              >
                <option value="todos">Todos</option>
                <option value="usuario1">{usuario1Nome}</option>
                <option value="usuario2">{usuario2Nome}</option>
              </select>
              <ChevronDown size={15} className={styles.selectChevron} />
            </div>

            <div className={styles.selectWrap}>
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value as OrdenacaoContas)}
                className={styles.select}
              >
                <option value="nome">Nome (A-Z)</option>
                <option value="saldo-maior">Saldo (maior)</option>
                <option value="saldo-menor">Saldo (menor)</option>
                <option value="tipo">Tipo</option>
                <option value="proprietario">Proprietário</option>
              </select>
              <ArrowUpDown size={14} className={styles.selectChevron} />
            </div>

            <div className={styles.viewToggle} role="group" aria-label="Modo de visualização">
              <button
                type="button"
                onClick={() => setVisualizacao('cards')}
                className={`${styles.viewBtn} ${visualizacao === 'cards' ? styles.viewBtnActive : ''}`}
                aria-label="Visualização em cards"
                title="Visualização em cards"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setVisualizacao('lista')}
                className={`${styles.viewBtn} ${visualizacao === 'lista' ? styles.viewBtnActive : ''}`}
                aria-label="Visualização em lista"
                title="Visualização em lista"
              >
                <List size={16} />
              </button>
            </div>

            {temFiltroAtivo && (
              <span className={styles.resultCount}>
                {contasFiltradas.length} {contasFiltradas.length === 1 ? 'conta encontrada' : 'contas encontradas'}
              </span>
            )}

            <PrivacyToggleButton sectionKey="minhas-contas" />

            <button className={styles.addBtn} onClick={handleAddConta} aria-label="Adicionar conta">
              <Plus size={17} />
              <span>Adicionar</span>
            </button>
          </div>

          {contasFiltradas.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}><Wallet size={26} /></div>
              <div>
                <div className={styles.emptyStateTitle}>Nenhuma conta encontrada</div>
                <div className={styles.emptyStateMessage}>
                  {temFiltroAtivo ? 'Tente ajustar os filtros de busca.' : 'Adicione contas para acompanhar seus saldos.'}
                </div>
              </div>
              <button className={styles.emptyStateAction} onClick={handleAddConta}>Adicionar conta</button>
            </div>
          ) : visualizacao === 'cards' ? (
            <div className={styles.grid}>
              {contasFiltradas
                .filter(c => c.ativa)
                .map((conta) => (
                  <div key={conta.id} id={`conta-${conta.id}`}>
                    <ContaCard
                      conta={conta}
                      hideSaldo={hideContasValues}
                      onEdit={handleEditConta}
                      onDelete={handleDeleteConta}
                      onToggleAtiva={toggleContaAtiva}
                      onDuplicate={handleDuplicateConta}
                    />
                  </div>
                ))}
              {contasFiltradas.filter(c => !c.ativa).length > 0 && (
                <>
                  <div className={styles.sectionLabel}>Contas inativas</div>
                  {contasFiltradas
                    .filter(c => !c.ativa)
                    .map((conta) => (
                      <div key={conta.id} id={`conta-${conta.id}`}>
                        <ContaCard
                          conta={conta}
                          hideSaldo={hideContasValues}
                          onEdit={handleEditConta}
                          onDelete={handleDeleteConta}
                          onToggleAtiva={toggleContaAtiva}
                          onDuplicate={handleDuplicateConta}
                        />
                      </div>
                    ))}
                </>
              )}
            </div>
          ) : (
            <ContasList
              contas={contasFiltradas}
              hideSaldo={hideContasValues}
              onEdit={handleEditConta}
              onDelete={handleDeleteConta}
              onDuplicate={handleDuplicateConta}
            />
          )}
        </>
      )}

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
