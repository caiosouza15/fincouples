import { useState, useMemo } from 'react';
import { Plus, Wallet, Search, ChevronDown, ArrowUpDown, LayoutGrid, List } from 'lucide-react';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { useContas } from '@/hooks/useContas';
import { useSectionPrivacy } from '@/hooks/usePrivacy';
import { useToast } from '@/hooks/useToast';
import { PrivacyToggleButton } from '@/components/PrivacyToggleButton';
import type { Conta } from '@/types';
import { ContasList } from '@/modules/Configuracoes/Contas/ContasList';
import { ContaForm } from '@/modules/Configuracoes/Contas/ContaForm';
import { ResumoContas } from '@/modules/Contas/ResumoContas';
import { useCasal } from '@/hooks/useCasal';
import { useAlertasSaldo } from '@/hooks/useAlertasSaldo';
import { AlertasSaldoCard } from '@/components/AlertasSaldoCard';
import { ContaCard } from '@/components/ContaCard';

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
    <div className="max-w-[1280px] mx-auto pb-xl">
      <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-lg">Minhas Contas</h1>

      {alertasSaldo.length > 0 && (
        <div className="mb-lg">
          <AlertasSaldoCard alertas={alertasSaldo} hideSaldo={hideContasValues} />
        </div>
      )}
      {contas.length > 0 && (
        <div className="mb-lg">
          <ResumoContas contas={contas} hideSaldo={hideContasValues} />
        </div>
      )}

      <Card
        title="Minhas contas"
        actions={
          <div className="flex items-center gap-sm">
            <button
              className="px-md py-sm bg-positive text-white rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-positive/90 flex items-center justify-center gap-xs shrink-0"
              onClick={handleAddConta}
              aria-label="Adicionar conta"
              title="Adicionar conta"
            >
              <Plus size={18} strokeWidth={2} className="shrink-0" />
              <span className="hidden md:inline">Adicionar</span>
            </button>
            {contas.length > 0 && (
              <>
                <div className="flex border border-border rounded-md overflow-hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => setVisualizacao('cards')}
                    className={`p-sm ${visualizacao === 'cards' ? 'bg-background text-positive' : 'bg-surface text-text-secondary hover:bg-background'}`}
                    aria-label="Visualização em cards"
                    title="Visualização em cards"
                  >
                    <LayoutGrid size={18} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisualizacao('lista')}
                    className={`p-sm ${visualizacao === 'lista' ? 'bg-background text-positive' : 'bg-surface text-text-secondary hover:bg-background'}`}
                    aria-label="Visualização em lista"
                    title="Visualização em lista"
                  >
                    <List size={18} strokeWidth={2} />
                  </button>
                </div>
                <PrivacyToggleButton sectionKey="minhas-contas" />
              </>
            )}
          </div>
        }
      >
        {contas.length === 0 ? (
          <EmptyState
            icon={<Wallet size={32} className="text-text-secondary" />}
            title="Nenhuma conta cadastrada"
            message="Adicione contas para acompanhar seus saldos."
            actionButton={
              <button
                className="bg-positive text-white py-sm px-md rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-positive/90"
                onClick={handleAddConta}
              >
                Adicionar conta
              </button>
            }
          />
        ) : (
          <>
            <div className="mb-md flex flex-col md:flex-row gap-sm">
              <div className="relative flex-1 min-w-0">
                <Search size={18} strokeWidth={2} className="absolute left-md top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar conta..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-9 pr-md py-sm border border-border rounded-md text-sm text-text-primary bg-surface focus:outline-none focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)]"
                />
              </div>
              <div className="relative min-w-[120px]">
                <ChevronDown size={18} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none shrink-0" />
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value as FiltroStatus)}
                  className="w-full min-h-[40px] pl-4 pr-9 py-2.5 border border-border rounded-md text-sm text-text-primary bg-surface focus:outline-none focus:border-positive appearance-none cursor-pointer"
                >
                  <option value="todos">Todos</option>
                  <option value="ativos">Ativos</option>
                  <option value="inativos">Inativos</option>
                </select>
              </div>
              <div className="relative min-w-[160px]">
                <ChevronDown size={18} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none shrink-0" />
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value as FiltroTipo)}
                  className="w-full min-h-[40px] pl-4 pr-9 py-2.5 border border-border rounded-md text-sm text-text-primary bg-surface focus:outline-none focus:border-positive appearance-none cursor-pointer"
                >
                  <option value="todos">Todos os tipos</option>
                  <option value="corrente">Conta Corrente</option>
                  <option value="poupanca">Poupança</option>
                  <option value="investimento">Investimento</option>
                </select>
              </div>
              <div className="relative min-w-[140px]">
                <ChevronDown size={18} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none shrink-0" />
                <select
                  value={filtroProprietario}
                  onChange={(e) => setFiltroProprietario(e.target.value as FiltroProprietario)}
                  className="w-full min-h-[40px] pl-4 pr-9 py-2.5 border border-border rounded-md text-sm text-text-primary bg-surface focus:outline-none focus:border-positive appearance-none cursor-pointer"
                >
                  <option value="todos">Todos</option>
                  <option value="usuario1">{usuario1Nome}</option>
                  <option value="usuario2">{usuario2Nome}</option>
                </select>
              </div>
              <div className="relative min-w-[140px]">
                <ArrowUpDown size={18} strokeWidth={2} className="absolute left-md top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none shrink-0" />
                <select
                  value={ordenacao}
                  onChange={(e) => setOrdenacao(e.target.value as OrdenacaoContas)}
                  className="w-full pl-9 pr-md py-sm border border-border rounded-md text-sm text-text-primary bg-surface focus:outline-none focus:border-positive appearance-none cursor-pointer min-h-[40px]"
                >
                  <option value="nome">Nome (A-Z)</option>
                  <option value="saldo-maior">Saldo (maior)</option>
                  <option value="saldo-menor">Saldo (menor)</option>
                  <option value="tipo">Tipo</option>
                  <option value="proprietario">Proprietário</option>
                </select>
              </div>
              {temFiltroAtivo && (
                <div className="text-xs text-text-secondary flex items-center">
                  {contasFiltradas.length} {contasFiltradas.length === 1 ? 'conta encontrada' : 'contas encontradas'}
                </div>
              )}
            </div>
            {contasFiltradas.length === 0 ? (
              <EmptyState
                icon={<Wallet size={32} className="text-text-secondary" />}
                title="Nenhuma conta encontrada"
                message={temFiltroAtivo ? 'Tente ajustar os filtros de busca.' : 'Adicione contas para acompanhar seus saldos.'}
                actionButton={
                  <button
                    className="bg-positive text-white py-sm px-md rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-positive/90"
                    onClick={handleAddConta}
                  >
                    Adicionar conta
                  </button>
                }
              />
            ) : visualizacao === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
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
                    <div className="col-span-full text-sm font-semibold text-text-secondary uppercase mb-xs py-xs">
                      Contas inativas
                    </div>
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
