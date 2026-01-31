import { useState } from 'react';
import { Eye, Minus, Plus, GraduationCap } from 'lucide-react';
import { Card } from '@/components/Card';
import { useContas } from '@/hooks/useContas';
import { useLancamentos } from '@/hooks/useLancamentos';
import { useCategorias } from '@/hooks/useCategorias';
import { useSelectedMonth } from '@/contexts/SelectedMonthContext';
import type { Conta, Lancamento } from '@/types';
import { ContasList } from '@/modules/Configuracoes/Contas/ContasList';
import { ContaForm } from '@/modules/Configuracoes/Contas/ContaForm';
import { LancamentoForm } from '@/modules/Lancamentos/LancamentoForm';
import { formatCurrency } from '@/utils';
import { iconMap } from '@/utils/iconMap';

const Dashboard = () => {
  const { contas, getSaldoGeral, addConta, editConta, removeConta, toggleContaAtiva } = useContas();
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

  const [hidePoupancaInvestimento, setHidePoupancaInvestimento] = useState(false);
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
      } else {
        await addLancamento(lancamentoData);
      }
      setShowLancamentoForm(false);
      setLancamentoEditando(null);
      setTipoPreSelecionado(undefined);
    } catch (error) {
      console.error('Erro ao salvar lançamento:', error);
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
        <h2 className="text-xl font-semibold text-text-primary mb-md">{saudacao}</h2>
        <Card className="bg-gradient-to-br from-surface to-[#f0f9ff]">
          <div className="flex flex-col gap-sm">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary uppercase font-medium">Saldo geral</span>
              <button className="bg-transparent border-none cursor-pointer p-xs opacity-70 transition-opacity duration-200 text-text-secondary hover:opacity-100 hover:text-text-primary" aria-label="Mostrar/Ocultar saldo">
                <Eye size={20} />
              </button>
            </div>
            <div className="text-3xl md:text-[2rem] lg:text-[3rem] font-bold text-text-primary leading-none">
              {formatCurrency(saldoGeral)}
            </div>
            <a href="#" className="text-text-secondary text-sm underline">Ver relatórios</a>
          </div>
        </Card>
      </section>

      {/* Resumo Mensal */}
      <section className="mb-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <Card className="text-center relative">
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
                + {formatCurrency(receitaMensal)}
              </div>
            ) : (
              <div className="text-lg text-text-muted">
                Nenhuma receita registrada
              </div>
            )}
          </Card>
          
          <Card className="text-center relative">
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
                - {formatCurrency(despesaMensal)}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-md">
        {/* Card 1: Últimos Gastos */}
        <Card title="Últimos gastos">
          <div className="flex flex-col gap-md">
            {ultimosGastos.length === 0 ? (
              <div className="text-center py-md text-text-muted">
                <p className="text-sm">Nenhum gasto registrado ainda</p>
              </div>
            ) : (
              ultimosGastos.map((gasto) => {
                const categoria = categorias.find((c) => c.id === gasto.categoriaId);
                const IconComponent = categoria?.icone
                  ? iconMap[categoria.icone]
                  : null;
                const dataFormatada = gasto.data.toLocaleDateString('pt-BR', {
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
                          {formatCurrency(gasto.valor)}
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
        <Card title="Maiores gastos">
          <div className="flex flex-col gap-md">
            {maioresGastos.length === 0 ? (
              <div className="text-center py-md text-text-muted">
                <p className="text-sm">Nenhum gasto registrado ainda</p>
              </div>
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
                        {formatCurrency(gasto.valor)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Card 3: Últimas Faturas */}
        <Card title="Últimas faturas">
          <div className="text-center py-md text-text-muted">
            <p className="text-sm mb-md">Nenhum cartão cadastrado ainda</p>
            <button className="bg-transparent text-text-primary border border-border py-sm px-md rounded-md text-xs font-medium cursor-pointer transition-colors duration-200 hover:bg-background">
              Adicionar cartão
            </button>
          </div>
        </Card>
      </div>

      {/* Minhas Contas */}
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
          <div className="text-center py-xl text-text-muted">
            <p className="mb-md">Nenhuma conta cadastrada ainda</p>
            <button className="bg-transparent text-text-primary border border-border py-sm px-md rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-background" onClick={handleAddConta}>Adicionar conta</button>
          </div>
        ) : (
          <ContasList
            contas={contas}
            hidePoupancaInvestimento={hidePoupancaInvestimento}
            onEdit={handleEditConta}
            onDelete={handleDeleteConta}
            onToggleAtiva={toggleContaAtiva}
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
          onClose={handleCloseLancamentoForm}
          onSave={handleSaveLancamento}
        />
      )}

      {/* Cartões de Crédito */}
      <Card title="Cartões de crédito">
        <div className="text-center py-xl text-text-muted">
          <p className="mb-md">Nenhum cartão cadastrado ainda</p>
          <button className="bg-transparent text-text-primary border border-border py-sm px-md rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-background">Adicionar cartão</button>
        </div>
      </Card>

      {/* Metas do Mês */}
      <Card title="Metas de Novembro">
        <div className="text-center py-xl text-text-muted">
          <p className="mb-md">Nenhuma meta criada ainda</p>
          <button className="bg-transparent text-text-primary border border-border py-sm px-md rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-background">Criar meta</button>
        </div>
      </Card>

      {/* Equilíbrio Financeiro */}
      <Card 
        title="Equilíbrio financeiro"
        actions={<a href="#" className="text-text-secondary text-sm underline">Saiba mais</a>}
      >
        <div>
          <div className="p-md bg-background rounded-md">
            <div className="font-medium text-text-primary mb-sm">Gastos essenciais</div>
            <div>
              <div className="text-xl font-bold text-text-primary mb-xs">R$ 0,00</div>
              <div className="text-sm text-text-secondary">Limite recomendado: R$ 0,00</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
