import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Minus, Plus, GraduationCap } from 'lucide-react';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { PrivacyToggleButton } from '@/components/PrivacyToggleButton';
import { useContas } from '@/hooks/useContas';
import { useLancamentos } from '@/hooks/useLancamentos';
import { useCategorias } from '@/hooks/useCategorias';
import { useFaturas } from '@/hooks/useFaturas';
import { useCartoes } from '@/hooks/useCartoes';
import { useMetas } from '@/hooks/useMetas';
import { useSectionPrivacy } from '@/hooks/usePrivacy';
import { useToast } from '@/hooks/useToast';
import { useSelectedMonth } from '@/contexts/SelectedMonthContext';
import type { Conta, Lancamento, CartaoCredito } from '@/types';
import { ContasList } from '@/modules/Configuracoes/Contas/ContasList';
import { ContaForm } from '@/modules/Configuracoes/Contas/ContaForm';
import { LancamentoForm } from '@/modules/Lancamentos/LancamentoForm';
import { CartoesList } from '@/modules/Configuracoes/Cartoes/CartoesList';
import { formatCurrencyWithPrivacy } from '@/utils';
import { iconMap } from '@/utils/iconMap';

const DashboardLegacy = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { contas, getSaldoGeral, addConta, editConta, removeConta } = useContas();
  const {
    lancamentos: allLancamentos,
    getReceitaMensal,
    getDespesaMensal,
    getMaioresGastos,
    getUltimosGastos,
    getSaldoDisponivelMes,
    addLancamento,
    editLancamento,
  } = useLancamentos();
  const { categorias } = useCategorias();
  const { faturas, getFaturaAtual, fetchFaturas } = useFaturas();
  const { cartoes, removeCartao, toggleCartaoAtivo } = useCartoes();
  const { metas } = useMetas();
  
  // Estados de privacidade por seção
  const saldoGeralPrivacy = useSectionPrivacy('saldo-geral');
  const ultimosGastosPrivacy = useSectionPrivacy('ultimos-gastos');
  const maioresGastosPrivacy = useSectionPrivacy('maiores-gastos');
  const ultimasFaturasPrivacy = useSectionPrivacy('ultimas-faturas');
  const minhasContasPrivacy = useSectionPrivacy('minhas-contas');
  const cartoesCreditoPrivacy = useSectionPrivacy('cartoes-credito');
  const [showForm, setShowForm] = useState(false);
  const [contaEditando, setContaEditando] = useState<Conta | null>(null);
  const [showLancamentoForm, setShowLancamentoForm] = useState(false);
  const [lancamentoEditando, setLancamentoEditando] = useState<Lancamento | null>(null);
  const [tipoPreSelecionado, setTipoPreSelecionado] = useState<'receita' | 'despesa' | undefined>();
  
  // Usar mês selecionado do contexto global
  const { selectedMonth } = useSelectedMonth();

  const saudacao = "Boa tarde, Casal! 👋";
  
  // Calcular saldo disponível do mês selecionado
  const saldoAtualContas = getSaldoGeral();
  const saldoGeral = getSaldoDisponivelMes(saldoAtualContas, selectedMonth);
  
  // Debug: verificar lançamentos e cálculos
  console.log('🔍 [Dashboard] Total de lançamentos no contexto:', allLancamentos.length);
  console.log('🔍 [Dashboard] Mês selecionado:', selectedMonth);
  
  const receitaMensal = getReceitaMensal(selectedMonth);
  const despesaMensal = getDespesaMensal(selectedMonth);
  
  console.log('🔍 [Dashboard] Receita mensal calculada:', receitaMensal);
  console.log('🔍 [Dashboard] Despesa mensal calculada:', despesaMensal);
  console.log('🔍 [Dashboard] Saldo disponível do mês:', saldoGeral);
  
  // Debug: verificar lançamentos do mês selecionado
  const lancamentosDoMes = allLancamentos.filter(l => {
    const year = l.data.getFullYear();
    const month = String(l.data.getMonth() + 1).padStart(2, '0');
    const mesKey = `${year}-${month}`;
    return mesKey === selectedMonth;
  });
  console.log('🔍 [Dashboard] Lançamentos do mês selecionado:', lancamentosDoMes.length);
  if (lancamentosDoMes.length > 0) {
    console.log('🔍 [Dashboard] Primeiro lançamento do mês:', {
      tipo: lancamentosDoMes[0].tipo,
      valor: lancamentosDoMes[0].valor,
      data: lancamentosDoMes[0].data,
      dataString: lancamentosDoMes[0].data.toString(),
    });
  }
  
  const maioresGastos = getMaioresGastos(categorias, 5, selectedMonth);
  const ultimosGastos = getUltimosGastos(selectedMonth, 5);

  // Filtrar faturas do mês selecionado
  const faturasDoMes = faturas.filter(f => {
    const [ano, mes] = selectedMonth.split('-');
    return f.mesReferencia === `${ano}-${mes}`;
  });

  // Gerar faturas automaticamente quando há cartões e mudar de mês
  useEffect(() => {
    const gerarFaturasParaCartoes = async () => {
      if (cartoes.length === 0) return;
      
      const cartoesAtivos = cartoes.filter(c => c.ativo);
      for (const cartao of cartoesAtivos) {
        try {
          await getFaturaAtual(cartao.id, selectedMonth);
        } catch (error) {
          console.error(`Erro ao gerar fatura para cartão ${cartao.id}:`, error);
        }
      }
      // Atualizar lista de faturas após gerar
      await fetchFaturas();
    };

    gerarFaturasParaCartoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, cartoes.length]);

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

  const handleAddCartao = () => {
    navigate('/cartoes');
  };

  const handleEditCartao = (_cartao: CartaoCredito) => {
    navigate('/cartoes');
  };

  const handleDeleteCartao = async (id: string) => {
    await removeCartao(id);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setContaEditando(null);
  };

  const handleAddDespesa = () => {
    setLancamentoEditando(null);
    setTipoPreSelecionado('despesa');
    setShowLancamentoForm(true);
  };

  const handleAddReceita = () => {
    setLancamentoEditando(null);
    setTipoPreSelecionado('receita');
    setShowLancamentoForm(true);
  };

  const handleSaveLancamento = async (lancamentoData: Omit<Lancamento, 'id'> | Lancamento) => {
    try {
      if ('id' in lancamentoData) {
        await editLancamento(lancamentoData.id, lancamentoData);
        showToast('Lançamento atualizado com sucesso', 'success');
      } else {
        await addLancamento(lancamentoData);
        showToast('Lançamento salvo com sucesso', 'success');
      }
      setShowLancamentoForm(false);
      setLancamentoEditando(null);
      setTipoPreSelecionado(undefined);
    } catch (error) {
      console.error('Erro ao salvar lançamento:', error);
      showToast('Erro ao salvar lançamento', 'error');
    }
  };

  const handleCloseLancamentoForm = () => {
    setShowLancamentoForm(false);
    setLancamentoEditando(null);
    setTipoPreSelecionado(undefined);
  };

  return (
    <div className="max-w-[1280px] mx-auto pb-xl">
      {/* Saudação e Saldo Geral */}
      <section className="mb-lg">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-md">{saudacao}</h1>
        <Card className="bg-gradient-to-br from-surface to-background dark:from-surface dark:to-surface">
          <div className="flex flex-col gap-sm">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary uppercase font-medium">Saldo geral</span>
              <PrivacyToggleButton sectionKey="saldo-geral" />
            </div>
            <div className="text-3xl md:text-[2rem] lg:text-[3rem] font-bold text-text-primary leading-none">
              {formatCurrencyWithPrivacy(saldoGeral, saldoGeralPrivacy.hidden)}
            </div>
            <Link to="/relatorios" className="text-text-secondary text-sm underline hover:text-teal transition-colors">Ver relatórios</Link>
          </div>
        </Card>
      </section>

      {/* Resumo Mensal */}
      <section className="mb-md">
        <div className="flex flex-wrap gap-md">
          <Card className="text-center relative min-w-[280px] flex-1 basis-[280px] mb-0">
            <button
              onClick={handleAddReceita}
              className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-positive/10 hover:bg-positive/20 text-positive transition-colors duration-200 cursor-pointer text-xs font-medium"
              aria-label="Adicionar receita"
            >
              <Plus size={16} />
              <span>Adicionar</span>
            </button>
            <div className="text-sm text-text-secondary uppercase mb-sm">Receita mensal</div>
            {receitaMensal > 0 ? (
              <div className="text-2xl font-bold text-positive">
                + {formatCurrencyWithPrivacy(receitaMensal, saldoGeralPrivacy.hidden)}
              </div>
            ) : (
              <div className="text-lg text-text-muted">
                Nenhuma receita registrada
              </div>
            )}
          </Card>
          
          <Card className="text-center relative min-w-[280px] flex-1 basis-[280px] mb-0">
            <button
              onClick={handleAddDespesa}
              className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-negative/10 hover:bg-negative/20 text-negative transition-colors duration-200 cursor-pointer text-xs font-medium"
              aria-label="Adicionar despesa"
            >
              <Minus size={16} />
              <span>Adicionar</span>
            </button>
            <div className="text-sm text-text-secondary uppercase mb-sm">Despesa mensal</div>
            {despesaMensal > 0 ? (
              <div className="text-2xl font-bold text-negative">
                - {formatCurrencyWithPrivacy(despesaMensal, saldoGeralPrivacy.hidden)}
              </div>
            ) : (
              <div className="text-lg text-text-muted">
                Nenhuma despesa registrada
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* Últimos Gastos, Maiores Gastos e Últimas Faturas */}
      <div className="flex flex-wrap gap-md mb-md">
        {/* Card 1: Últimos Gastos */}
        <Card title="Últimos gastos" actions={<PrivacyToggleButton sectionKey="ultimos-gastos" />} className="min-w-[280px] flex-1 basis-[280px] mb-0">
          <div className="flex flex-col gap-md">
            {ultimosGastos.length === 0 ? (
              <EmptyState 
                title="Nenhum gasto registrado ainda"
                message="Que tal começar registrando seus gastos?"
              />
            ) : (
              ultimosGastos.map((gasto) => {
                const categoria = categorias.find((c) => c.id === gasto.categoriaId);
                const IconComponent = categoria?.icone
                  ? iconMap[categoria.icone]
                  : null;
                const dataObj = gasto.data instanceof Date ? gasto.data : new Date(gasto.data);
                const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                });
                return (
                  <div key={gasto.id} className="flex items-center gap-md p-sm bg-background rounded-md">
                    <div className="w-10 h-10 flex items-center justify-center bg-surface rounded-md text-text-secondary flex-shrink-0">
                      {IconComponent ? (
                        <IconComponent size={20} />
                      ) : (
                        <GraduationCap size={20} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-text-primary text-sm mb-xs truncate">
                        {gasto.descricao || categoria?.nome || 'Sem descrição'}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs text-text-secondary">{dataFormatada}</div>
                      <div className="text-sm font-semibold text-negative">
                        {formatCurrencyWithPrivacy(gasto.valor, ultimosGastosPrivacy.hidden)}
                      </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Card 2: Maiores Gastos */}
        <Card title="Maiores gastos" actions={<PrivacyToggleButton sectionKey="maiores-gastos" />} className="min-w-[280px] flex-1 basis-[280px] mb-0">
          <div className="flex flex-col gap-md">
            {maioresGastos.length === 0 ? (
              <EmptyState 
                title="Nenhum gasto registrado ainda"
                message="Que tal começar registrando seus gastos?"
              />
            ) : (
              maioresGastos.map((gasto) => {
                const IconComponent = gasto.categoria.icone
                  ? iconMap[gasto.categoria.icone]
                  : null;
                return (
                  <div key={gasto.categoriaId} className="flex items-center gap-md p-sm bg-background rounded-md">
                    <div className="w-10 h-10 flex items-center justify-center bg-surface rounded-md text-text-secondary flex-shrink-0">
                      {IconComponent ? (
                        <IconComponent size={20} />
                      ) : (
                        <GraduationCap size={20} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-text-primary text-sm mb-xs truncate">
                        {gasto.categoria.nome}
                      </div>
                      <div className="text-sm text-text-secondary font-semibold">
                        {formatCurrencyWithPrivacy(gasto.valor, maioresGastosPrivacy.hidden)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Card 3: Últimas Faturas */}
        <Card title="Últimas faturas" actions={<PrivacyToggleButton sectionKey="ultimas-faturas" />} className="min-w-[280px] flex-1 basis-[280px] mb-0">
          {cartoes.length === 0 ? (
            <EmptyState 
              hideText={true}
              actionButton={
                <button 
                  className="bg-transparent text-text-primary border border-border py-sm px-md rounded-md text-xs font-medium cursor-pointer transition-colors duration-200 hover:bg-background"
                  onClick={handleAddCartao}
                >
                  Ir para página de cartões
                </button>
              }
            />
          ) : faturasDoMes.length === 0 ? (
            <EmptyState 
              title="Nenhuma fatura encontrada"
              message="Não há faturas para o mês selecionado."
            />
          ) : (
            <div className="flex flex-col gap-sm">
              {faturasDoMes.slice(0, 5).map((fatura) => {
                const cartao = cartoes.find(c => c.id === fatura.cartaoId);
                const formatMes = (mesRef: string) => {
                  const [ano, mes] = mesRef.split('-');
                  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                  return `${meses[parseInt(mes) - 1]}/${ano}`;
                };
                const getStatusColor = () => {
                  switch (fatura.status) {
                    case 'pago_total': return 'text-positive';
                    case 'pago_parcial': return 'text-warning';
                    default: return 'text-negative';
                  }
                };
                return (
                  <div key={fatura.id} className="flex items-center justify-between p-sm bg-background rounded-md">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-text-primary text-sm mb-xs truncate">
                        {cartao?.nome || 'Cartão'}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {formatMes(fatura.mesReferencia)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${getStatusColor()}`}>
                        {formatCurrencyWithPrivacy(fatura.valorTotal, ultimasFaturasPrivacy.hidden)}
                      </div>
                      {fatura.status === 'pago_parcial' && (
                        <div className="text-xs text-text-secondary">
                          Pago: {formatCurrencyWithPrivacy(fatura.valorPago, ultimasFaturasPrivacy.hidden)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Minhas Contas */}
      <Card 
        title="Minhas contas"
        actions={<PrivacyToggleButton sectionKey="minhas-contas" />}
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
          <ContasList
            contas={contas}
            hideSaldo={minhasContasPrivacy.hidden}
            onEdit={handleEditConta}
            onDelete={handleDeleteConta}
          />
        )}
      </Card>

      {showForm && (
        <ContaForm
          conta={contaEditando}
          onClose={handleCloseForm}
          onSave={handleSaveConta}
        />
      )}

      {showLancamentoForm && (
        <LancamentoForm
          lancamento={lancamentoEditando}
          tipoPreSelecionado={tipoPreSelecionado}
          mesPreSelecionado={selectedMonth}
          onClose={handleCloseLancamentoForm}
          onSave={handleSaveLancamento}
        />
      )}

      {/* Cartões de Crédito */}
      <Card title="Cartões de crédito" actions={<PrivacyToggleButton sectionKey="cartoes-credito" />}>
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
          <CartoesList
            cartoes={cartoes}
            hideValues={cartoesCreditoPrivacy.hidden}
            onEdit={handleEditCartao}
            onDelete={handleDeleteCartao}
            onToggleAtivo={toggleCartaoAtivo}
          />
        )}
      </Card>

      {/* Metas do Mês */}
      <Card
        title={`Metas de ${new Date(selectedMonth + '-01').toLocaleDateString('pt-BR', { month: 'long' }).replace(/^./, (c) => c.toUpperCase())}`}
        actions={<Link to="/metas" className="text-text-secondary text-sm underline hover:text-teal transition-colors">Ver todas</Link>}
      >
        {metas.filter((m) => !m.concluida).length === 0 ? (
          <EmptyState
            hideText={true}
            actionButton={
              <Link
                to="/metas"
                className="bg-transparent text-text-primary border border-border py-sm px-md rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-background inline-block"
              >
                Criar meta
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-sm">
            {metas
              .filter((m) => !m.concluida)
              .slice(0, 3)
              .map((meta) => {
                const pct = meta.valorObjetivo > 0 ? Math.min(100, Math.round((meta.valorAtual / meta.valorObjetivo) * 100)) : 0;
                return (
                  <Link key={meta.id} to="/metas" className="p-sm bg-background rounded-md border border-border hover:border-positive/50 transition-colors">
                    <div className="flex justify-between items-center mb-xs">
                      <span className="font-medium text-text-primary text-sm truncate">{meta.titulo}</span>
                      <span className="text-xs text-positive font-medium">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                      <div className="h-full bg-positive rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </Link>
                );
              })}
          </div>
        )}
      </Card>

    </div>
  );
};

export default DashboardLegacy;
