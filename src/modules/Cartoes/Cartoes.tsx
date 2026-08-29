import { useState, useMemo } from 'react';
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
import { LayoutGrid, List, Plus, Search, ArrowUpDown, ChevronDown, CreditCard } from 'lucide-react';
import { AlertasCard } from '@/components/AlertasCard';
import { CartaoCard } from '@/components/CartaoCard';
import { PrivacyToggleButton } from '@/components/PrivacyToggleButton';
import styles from './Cartoes.module.css';

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
        setTimeout(() => {
          const element = document.getElementById(`cartao-${novoCartao.id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    const element = document.getElementById(`fatura-${faturaId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const cartoesFiltrados = useMemo(() => {
    let filtrados = cartoes;

    if (filtroStatus === 'ativos') {
      filtrados = filtrados.filter(c => c.ativo);
    } else if (filtroStatus === 'inativos') {
      filtrados = filtrados.filter(c => !c.ativo);
    }

    if (filtroProprietario !== 'todos') {
      filtrados = filtrados.filter(c => c.proprietarioId === filtroProprietario);
    }

    if (busca.trim()) {
      const buscaLower = busca.toLowerCase().trim();
      filtrados = filtrados.filter(c => c.nome.toLowerCase().includes(buscaLower));
    }

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

  const faturasExibidas = faturas.filter(f => {
    const [ano, mes] = selectedMonth.split('-');
    return f.mesReferencia === `${ano}-${mes}`;
  });

  const temFiltroAtivo = !!busca || filtroStatus !== 'todos' || filtroProprietario !== 'todos';

  return (
    <div className={styles.page}>
      {cartoes.length > 0 && <ResumoCard cartoes={cartoes} faturas={faturas} selectedMonth={selectedMonth} />}

      {alertas.length > 0 && <AlertasCard alertas={alertas} onVerFatura={handleVerFatura} />}

      {cartoes.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}><CreditCard size={26} /></div>
          <div>
            <div className={styles.emptyStateTitle}>Nenhum cartão cadastrado</div>
            <div className={styles.emptyStateMessage}>Adicione seu primeiro cartão de crédito.</div>
          </div>
          <button className={styles.emptyStateAction} onClick={handleAddCartao}>Adicionar cartão</button>
        </div>
      ) : (
        <>
          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon}><Search size={16} /></span>
              <input
                type="text"
                placeholder="Buscar cartão..."
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
                value={filtroProprietario}
                onChange={(e) => setFiltroProprietario(e.target.value as 'todos' | 'usuario1' | 'usuario2')}
                className={styles.select}
              >
                <option value="todos">Todos os proprietários</option>
                <option value="usuario1">{usuario1Nome}</option>
                <option value="usuario2">{usuario2Nome}</option>
              </select>
              <ChevronDown size={15} className={styles.selectChevron} />
            </div>

            <div className={styles.selectWrap}>
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value as 'nome' | 'limite' | 'uso' | 'fechamento')}
                className={styles.select}
              >
                <option value="nome">Nome (A-Z)</option>
                <option value="limite">Limite (maior)</option>
                <option value="uso">Uso (maior)</option>
                <option value="fechamento">Fechamento</option>
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
                {cartoesFiltrados.length} {cartoesFiltrados.length === 1 ? 'cartão encontrado' : 'cartões encontrados'}
              </span>
            )}

            <PrivacyToggleButton sectionKey="cartoes-credito" />

            <button className={styles.addBtn} onClick={handleAddCartao} aria-label="Adicionar cartão">
              <Plus size={17} />
              <span>Adicionar</span>
            </button>
          </div>

          {cartoesFiltrados.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}><CreditCard size={26} /></div>
              <div>
                <div className={styles.emptyStateTitle}>Nenhum cartão encontrado</div>
                <div className={styles.emptyStateMessage}>
                  {temFiltroAtivo ? 'Tente ajustar os filtros de busca.' : 'Adicione seu primeiro cartão de crédito.'}
                </div>
              </div>
              <button className={styles.emptyStateAction} onClick={handleAddCartao}>Adicionar cartão</button>
            </div>
          ) : visualizacao === 'cards' ? (
            <div className={styles.grid}>
              {cartoesFiltrados
                .filter(c => c.ativo)
                .map((cartao) => (
                  <div key={cartao.id} id={`cartao-${cartao.id}`}>
                    <CartaoCard
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
                  <div className={styles.sectionLabel}>Cartões inativos</div>
                  {cartoesFiltrados
                    .filter(c => !c.ativo)
                    .map((cartao) => (
                      <div key={cartao.id} id={`cartao-${cartao.id}`}>
                        <CartaoCard
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

      {cartoes.length > 0 && faturasExibidas.length > 0 && (
        <div className={styles.section}>
          <span className={styles.sectionTitle}>Faturas</span>
          <FaturasList
            faturas={faturasExibidas}
            cartoes={cartoes}
            lancamentos={lancamentos}
            categorias={categorias}
            onMarcarComoPaga={handleMarcarFaturaComoPaga}
          />
        </div>
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
