import { useState } from 'react';
import { Eye, Minus, Plus, GraduationCap } from 'lucide-react';
import { Card } from '@/components/Card';
import { useContas } from '@/hooks/useContas';
import type { Conta } from '@/types';
import { ContasList } from '@/modules/Configuracoes/Contas/ContasList';
import { ContaForm } from '@/modules/Configuracoes/Contas/ContaForm';
import { formatCurrency } from '@/utils';

const Dashboard = () => {
  const { contas, getSaldoGeral, addConta, editConta, removeConta, toggleContaAtiva } = useContas();
  const [hidePoupancaInvestimento, setHidePoupancaInvestimento] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [contaEditando, setContaEditando] = useState<Conta | null>(null);

  const saudacao = "Boa tarde, Casal! 👋";
  const saldoGeral = getSaldoGeral();
  const receitaMensal = 0;
  const despesaMensal = 0;

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
      <section className="grid grid-cols-1 md:grid-cols-2 gap-md mb-md">
        <Card className="text-center">
          <div className="text-sm text-text-secondary uppercase mb-sm">Receita mensal</div>
          <div className="text-2xl font-bold text-positive">
            + R$ {receitaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="text-sm text-text-secondary uppercase mb-sm">Despesa mensal</div>
          <div className="text-2xl font-bold text-negative">
            + R$ {despesaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Card>
      </section>

      {/* Acesso Rápido */}
      <Card title="Acesso rapido">
        <div className="flex flex-col md:flex-row gap-md justify-center items-center">
          <button className="flex flex-col items-center justify-center w-[100px] h-[100px] rounded-full border-none cursor-pointer font-semibold transition-transform duration-200 shadow-md hover:scale-105 hover:shadow-lg bg-negative text-white">
            <Minus size={32} strokeWidth={3} />
            <span className="text-xs uppercase tracking-wider mt-1">DESPESA</span>
          </button>
          <button className="flex flex-col items-center justify-center w-[100px] h-[100px] rounded-full border-none cursor-pointer font-semibold transition-transform duration-200 shadow-md hover:scale-105 hover:shadow-lg bg-positive text-white">
            <Plus size={32} strokeWidth={3} />
            <span className="text-xs uppercase tracking-wider mt-1">RECEITA</span>
          </button>
        </div>
      </Card>

      {/* Primeiros Passos (Onboarding) */}
      <Card title="Primeiros passos">
        <div className="flex flex-col gap-md">
          <div className="flex flex-col gap-sm">
            <div className="w-full h-2 bg-border rounded-sm overflow-hidden">
              <div className="h-full bg-positive transition-[width] duration-300" style={{ width: '20%' }}></div>
            </div>
            <span className="text-sm text-text-secondary">1 de 5 tarefas completas</span>
          </div>
          <button className="bg-positive text-white border-none py-md px-lg rounded-md text-base font-semibold cursor-pointer transition-colors duration-200 w-full hover:bg-[#20b255]">Continuar</button>
        </div>
      </Card>

      {/* Maiores Gastos */}
      <Card title="Maiores gastos nos últimos meses">
        <div className="flex flex-col gap-md">
          <div className="flex items-center gap-md p-md bg-background rounded-md">
            <div className="w-12 h-12 flex items-center justify-center bg-surface rounded-md text-text-secondary">
              <GraduationCap size={24} />
            </div>
            <div className="flex-1">
              <div className="font-medium text-text-primary mb-xs">Educacao</div>
              <div className="text-sm text-text-secondary">R$ 0,00</div>
            </div>
          </div>
          {/* Mais itens serão adicionados dinamicamente */}
          <div className="text-center py-xl text-text-muted">
            <p className="mb-md">Nenhum gasto registrado ainda</p>
          </div>
        </div>
      </Card>

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
          <>
            <ContasList
              contas={contas}
              hidePoupancaInvestimento={hidePoupancaInvestimento}
              onEdit={handleEditConta}
              onDelete={handleDeleteConta}
              onToggleAtiva={toggleContaAtiva}
            />
            <div className="mt-md">
              <button className="bg-transparent text-text-primary border border-border py-sm px-md rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-background" onClick={handleAddConta}>
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
