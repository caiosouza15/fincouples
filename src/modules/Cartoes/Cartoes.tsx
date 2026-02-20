import { useState, useMemo } from 'react';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { AlertasCard } from '@/components/AlertasCard';
import { CartaoCard } from '@/components/CartaoCard';
import { useCartoes } from '@/hooks/useCartoes';
import { useFaturas } from '@/hooks/useFaturas';
import { useLancamentos } from '@/hooks/useLancamentos';
import { useCategorias } from '@/hooks/useCategorias';
import { useSelectedMonth } from '@/contexts/SelectedMonthContext';
import { useAlertasVencimento } from '@/hooks/useAlertasVencimento';
import { useSectionPrivacy } from '@/hooks/usePrivacy';
import { useToast } from '@/hooks/useToast';
import { useCasal } from '@/hooks/useCasal';
import type { CartaoCredito } from '@/types';
import { CartoesList } from '@/modules/Configuracoes/Cartoes/CartoesList';
import { CartaoForm } from '@/modules/Configuracoes/Cartoes/CartaoForm';
import { FaturasList } from './FaturasList';
import { ResumoCard } from './ResumoCard';
import { LayoutGrid, List, Plus, Search, ArrowUpDown, ChevronDown } from 'lucide-react';
import { PrivacyToggleButton } from '@/components/PrivacyToggleButton';

const Cartoes = () => {
  const { cartoes, addCartao, editCartao, removeCartao, toggleCartaoAtivo } = useCartoes();
  const { faturas, marcarFaturaComoPaga } = useFaturas();
  const { lancamentos } = useLancamentos();
  const { categorias } = useCategorias();
  const { selectedMonth } = useSelectedMonth();
  const { alertas } = useAlertasVencimento();
  const { hidden: hideCartoesValues } = useSectionPrivacy('cartoes-credito');
  const { showToast } = useToast();
  const { usuario1Nome, usuario2Nome } = useCasal();
  
  const [showForm, setShowForm] = useState(false);
  const [cartaoEditando, setCartaoEditando] = useState<CartaoCredito | null>(null);
  const [visualizacao, setVisualizacao] = useState<'lista' | 'cards'>('cards');
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [filtroProprietario, setFiltroProprietario] = useState<'todos' | 'usuario1' | 'usuario2'>('todos');
  const [ordenacao, setOrdenacao] = useState<'nome' | 'limite' | 'uso' | 'fechamento'>('nome');

  const handleAddCartao = () => {
    setCartaoEditando(null);
    setShowForm(true);
  };

  const handleEditCartao = (cartao: CartaoCredito) => {
    setCartaoEditando(cartao);
    setShowForm(true);
  };

  const handleDuplicateCartao = (cartao: CartaoCredito) => {
    const cartaoDuplicado: CartaoCredito = {
      ...cartao,
      id: crypto.randomUUID(),
      nome: `${cartao.nome} (cópia)`,
      limiteDisponivel: cartao.limite,
      faturaAtual: 0,
    };
    setCartaoEditando(cartaoDuplicado);
    setShowForm(true);
  };

  const handleSaveCartao = async (cartaoData: Omit<CartaoCredito, 'id'> | CartaoCredito) => {
    try {
      if ('id' in cartaoData) {
        await editCartao(cartaoData.id, cartaoData);
        showToast('Cartão editado com sucesso', 'success');
      } else {
        const novoCartao = await addCartao(cartaoData);
        showToast('Cartão adicionado com sucesso', 'success');
        setShowForm(false);
        setCartaoEditando(null);
        // Scroll para o novo cartão após um delay maior para garantir renderização
        setTimeout(() => {
          const element = document.getElementById(`cartao-${novoCartao.id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Adicionar classe de destaque temporário
            element.classList.add('animate-pulse');
            setTimeout(() => {
              element.classList.remove('animate-pulse');
            }, 3000);
          }
        }, 300);
        return;
      }
      setShowForm(false);
      setCartaoEditando(null);
    } catch (error) {
      showToast('Erro ao salvar cartão', 'error');
      throw error;
    }
  };

  const handleDeleteCartao = async (id: string) => {
    try {
      await removeCartao(id);
      showToast('Cartão excluído com sucesso', 'success');
    } catch (error) {
      showToast('Erro ao excluir cartão', 'error');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCartaoEditando(null);
  };

  const handleMarcarFaturaComoPaga = async (faturaId: string, valorPago?: number) => {
    await marcarFaturaComoPaga(faturaId, valorPago);
  };

  const handleVerFatura = (faturaId: string) => {
    // Scroll para a fatura específica (implementação futura)
    const element = document.getElementById(`fatura-${faturaId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Filtrar, buscar e ordenar cartões
  const cartoesFiltrados = useMemo(() => {
    let filtrados = cartoes;

    // Filtro por status
    if (filtroStatus === 'ativos') {
      filtrados = filtrados.filter(c => c.ativo);
    } else if (filtroStatus === 'inativos') {
      filtrados = filtrados.filter(c => !c.ativo);
    }

    // Filtro por proprietário
    if (filtroProprietario !== 'todos') {
      filtrados = filtrados.filter(c => c.proprietarioId === filtroProprietario);
    }

    // Busca por nome
    if (busca.trim()) {
      const buscaLower = busca.toLowerCase().trim();
      filtrados = filtrados.filter(c => 
        c.nome.toLowerCase().includes(buscaLower)
      );
    }

    // Ordenação
    filtrados = [...filtrados].sort((a, b) => {
      switch (ordenacao) {
        case 'nome':
          return a.nome.localeCompare(b.nome, 'pt-BR');
        case 'limite':
          return b.limite - a.limite;
        case 'uso': {
          const usoA = a.limite > 0 ? (a.faturaAtual / a.limite) * 100 : 0;
          const usoB = b.limite > 0 ? (b.faturaAtual / b.limite) * 100 : 0;
          return usoB - usoA;
        }
        case 'fechamento':
          return a.fechamento - b.fechamento;
        default:
          return 0;
      }
    });

    return filtrados;
  }, [cartoes, busca, filtroStatus, filtroProprietario, ordenacao]);

  // Filtrar faturas do mês selecionado
  const faturasExibidas = faturas.filter(f => {
    const [ano, mes] = selectedMonth.split('-');
    return f.mesReferencia === `${ano}-${mes}`;
  });

  return (
    <div className="max-w-[1280px] mx-auto pb-xl">
      <h1 className="text-2xl font-bold text-text-primary mb-lg">Cartões de Crédito</h1>

      {/* Resumo */}
      {cartoes.length > 0 && (
        <ResumoCard
          cartoes={cartoes}
          faturas={faturas}
          selectedMonth={selectedMonth}
        />
      )}

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="mt-lg">
          <AlertasCard alertas={alertas} onVerFatura={handleVerFatura} />
        </div>
      )}

      <Card
        title="Meus cartões"
        actions={
          <div className="flex items-center gap-sm">
            <button
              className="px-md py-sm bg-positive text-white rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-[#16a34a] flex items-center justify-center gap-xs shrink-0"
              onClick={handleAddCartao}
              aria-label="Adicionar cartão"
              title="Adicionar cartão"
            >
              <Plus size={18} strokeWidth={2} className="shrink-0" />
              <span className="hidden md:inline">Adicionar</span>
            </button>
            {cartoes.length > 0 && (
              <>
                <PrivacyToggleButton sectionKey="cartoes-credito" />
                <button
                  className={`min-w-[36px] min-h-[36px] p-sm rounded-md transition-colors duration-200 flex items-center justify-center shrink-0 ${
                    visualizacao === 'cards'
                      ? 'bg-positive text-white'
                      : 'bg-surface text-text-secondary hover:bg-background'
                  }`}
                  onClick={() => setVisualizacao('cards')}
                  aria-label="Visualização em cards"
                  title="Visualização em cards"
                >
                  <LayoutGrid size={18} strokeWidth={2} className="shrink-0" />
                </button>
                <button
                  className={`min-w-[36px] min-h-[36px] p-sm rounded-md transition-colors duration-200 flex items-center justify-center shrink-0 ${
                    visualizacao === 'lista'
                      ? 'bg-positive text-white'
                      : 'bg-surface text-text-secondary hover:bg-background'
                  }`}
                  onClick={() => setVisualizacao('lista')}
                  aria-label="Visualização em lista"
                  title="Visualização em lista"
                >
                  <List size={18} strokeWidth={2} className="shrink-0" />
                </button>
              </>
            )}
          </div>
        }
      >
        {cartoes.length > 0 && (
          <div className="mb-md flex flex-col md:flex-row gap-sm">
            <div className="relative flex-1 min-w-0">
              <Search size={18} strokeWidth={2} className="absolute left-md top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none shrink-0" />
              <input
                type="text"
                placeholder="Buscar cartão..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-9 pr-md py-sm border border-border rounded-md text-sm text-text-primary bg-surface focus:outline-none focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)]"
              />
            </div>
            <div className="relative min-w-[120px]">
              <ChevronDown size={18} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none shrink-0" />
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as 'todos' | 'ativos' | 'inativos')}
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
                value={filtroProprietario}
                onChange={(e) => setFiltroProprietario(e.target.value as 'todos' | 'usuario1' | 'usuario2')}
                className="w-full min-h-[40px] pl-4 pr-9 py-2.5 border border-border rounded-md text-sm text-text-primary bg-surface focus:outline-none focus:border-positive appearance-none cursor-pointer"
              >
                <option value="todos">Todos os proprietários</option>
                <option value="usuario1">{usuario1Nome}</option>
                <option value="usuario2">{usuario2Nome}</option>
              </select>
            </div>
            <div className="relative min-w-[140px]">
              <ArrowUpDown size={18} strokeWidth={2} className="absolute left-md top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none shrink-0" />
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value as 'nome' | 'limite' | 'uso' | 'fechamento')}
                className="w-full pl-9 pr-md py-sm border border-border rounded-md text-sm text-text-primary bg-surface focus:outline-none focus:border-positive appearance-none cursor-pointer min-h-[40px]"
              >
                <option value="nome">Nome (A-Z)</option>
                <option value="limite">Limite (maior)</option>
                <option value="uso">Uso (maior)</option>
                <option value="fechamento">Fechamento</option>
              </select>
            </div>
            {(busca || filtroStatus !== 'todos' || filtroProprietario !== 'todos') && (
              <div className="text-xs text-text-secondary flex items-center">
                {cartoesFiltrados.length} {cartoesFiltrados.length === 1 ? 'cartão encontrado' : 'cartões encontrados'}
              </div>
            )}
          </div>
        )}
        {cartoes.length === 0 ? (
          <EmptyState 
            hideText={true}
            actionButton={
              <button
                className="bg-transparent text-text-primary border border-border py-sm px-md rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-background"
                onClick={handleAddCartao}
              >
                Adicionar cartão
              </button>
            }
          />
        ) : (
          <>
            {cartoesFiltrados.length === 0 ? (
              <EmptyState
                hideText={false}
                title="Nenhum cartão encontrado"
                message={busca || filtroStatus !== 'todos' 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Adicione seu primeiro cartão de crédito'}
                actionButton={
                  <button
                    className="bg-transparent text-text-primary border border-border py-sm px-md rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-background"
                    onClick={handleAddCartao}
                  >
                    Adicionar cartão
                  </button>
                }
              />
            ) : visualizacao === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                {cartoesFiltrados
                  .filter(c => c.ativo)
                  .map((cartao) => (
                    <div id={`cartao-${cartao.id}`}>
                      <CartaoCard
                        key={cartao.id}
                        cartao={cartao}
                        hideValues={hideCartoesValues}
                        onEdit={handleEditCartao}
                        onDelete={handleDeleteCartao}
                        onToggleAtivo={toggleCartaoAtivo}
                        onDuplicate={handleDuplicateCartao}
                      />
                    </div>
                  ))}
                {cartoesFiltrados.filter(c => !c.ativo).length > 0 && (
                  <>
                    <div className="col-span-full text-sm font-semibold text-text-secondary uppercase mb-xs py-xs">
                      Cartões Inativos
                    </div>
                    {cartoesFiltrados
                      .filter(c => !c.ativo)
                      .map((cartao) => (
                        <div id={`cartao-${cartao.id}`}>
                          <CartaoCard
                            key={cartao.id}
                            cartao={cartao}
                            hideValues={hideCartoesValues}
                            onEdit={handleEditCartao}
                            onDelete={handleDeleteCartao}
                            onToggleAtivo={toggleCartaoAtivo}
                            onDuplicate={handleDuplicateCartao}
                          />
                        </div>
                      ))}
                  </>
                )}
              </div>
            ) : (
              <CartoesList
                cartoes={cartoesFiltrados}
                hideValues={hideCartoesValues}
                onEdit={handleEditCartao}
                onDelete={handleDeleteCartao}
                onToggleAtivo={toggleCartaoAtivo}
              />
            )}
          </>
        )}
      </Card>

      {cartoes.length > 0 && faturasExibidas.length > 0 && (
        <Card
          title="Faturas"
          className="mt-lg"
        >
          <FaturasList
            faturas={faturasExibidas}
            cartoes={cartoes}
            lancamentos={lancamentos}
            categorias={categorias}
            onMarcarComoPaga={handleMarcarFaturaComoPaga}
          />
        </Card>
      )}

      {showForm && (
        <CartaoForm
          cartao={cartaoEditando}
          onClose={handleCloseForm}
          onSave={handleSaveCartao}
        />
      )}
    </div>
  );
};

export default Cartoes;
