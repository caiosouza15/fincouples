import { useState } from 'react';
import { Card } from '@/components/Card';
import { useContas } from '@/hooks/useContas';
import { Conta } from '@/types';
import { ContasList } from '@/modules/Configuracoes/Contas/ContasList';
import { ContaForm } from '@/modules/Configuracoes/Contas/ContaForm';
import { formatCurrency } from '@/utils';
import './Dashboard.css';

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
    <div className="dashboard">
      {/* Saudação e Saldo Geral */}
      <section className="dashboard-header">
        <h2 className="dashboard-greeting">{saudacao}</h2>
        <Card className="saldo-geral-card">
          <div className="saldo-geral-content">
            <div className="saldo-header">
              <span className="saldo-label">Saldo geral</span>
              <button className="icon-button" aria-label="Mostrar/Ocultar saldo">
                <span className="icon-eye">👁️</span>
              </button>
            </div>
            <div className="saldo-valor">
              {formatCurrency(saldoGeral)}
            </div>
            <a href="#" className="link-secondary">Ver relatórios</a>
          </div>
        </Card>
      </section>

      {/* Resumo Mensal */}
      <section className="resumo-mensal">
        <Card className="resumo-card receita">
          <div className="resumo-label">Receita mensal</div>
          <div className="resumo-valor positivo">
            + R$ {receitaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Card>
        
        <Card className="resumo-card despesa">
          <div className="resumo-label">Despesa mensal</div>
          <div className="resumo-valor negativo">
            + R$ {despesaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Card>
      </section>

      {/* Acesso Rápido */}
      <Card title="Acesso rápido">
        <div className="acesso-rapido">
          <button className="btn-rapido despesa">
            <span className="btn-rapido-icon">−</span>
            <span className="btn-rapido-texto">DESPESA</span>
          </button>
          <button className="btn-rapido receita">
            <span className="btn-rapido-icon">+</span>
            <span className="btn-rapido-texto">RECEITA</span>
          </button>
        </div>
      </Card>

      {/* Primeiros Passos (Onboarding) */}
      <Card title="Primeiros passos">
        <div className="onboarding">
          <div className="onboarding-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '20%' }}></div>
            </div>
            <span className="progress-text">1 de 5 tarefas completas</span>
          </div>
          <button className="btn-primary">Continuar</button>
        </div>
      </Card>

      {/* Maiores Gastos */}
      <Card title="Maiores gastos nos últimos meses">
        <div className="maiores-gastos">
          <div className="gasto-item">
            <div className="gasto-icone">🎓</div>
            <div className="gasto-info">
              <div className="gasto-categoria">Educação</div>
              <div className="gasto-valor">R$ 0,00</div>
            </div>
          </div>
          {/* Mais itens serão adicionados dinamicamente */}
          <div className="empty-state">
            <p>Nenhum gasto registrado ainda</p>
          </div>
        </div>
      </Card>

      {/* Minhas Contas */}
      <Card 
        title="Minhas contas"
        actions={
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={hidePoupancaInvestimento}
              onChange={(e) => setHidePoupancaInvestimento(e.target.checked)}
            />
            <span className="checkbox-text">Esconder saldo das contas poupanças / investimentos</span>
          </label>
        }
      >
        {contas.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma conta cadastrada ainda</p>
            <button className="btn-secondary" onClick={handleAddConta}>Adicionar conta</button>
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
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <button className="btn-secondary" onClick={handleAddConta}>
                + Adicionar conta
              </button>
            </div>
          </>
        )}
      </Card>

      {/* Modal de Formulário */}
      {showForm && (
        <ContaForm
          conta={contaEditando}
          onClose={handleCloseForm}
          onSave={handleSaveConta}
        />
      )}

      {/* Cartões de Crédito */}
      <Card title="Cartões de crédito">
        <div className="cartoes-lista">
          <div className="empty-state">
            <p>Nenhum cartão cadastrado ainda</p>
            <button className="btn-secondary">Adicionar cartão</button>
          </div>
        </div>
      </Card>

      {/* Metas do Mês */}
      <Card title="Metas de Novembro">
        <div className="metas-lista">
          <div className="empty-state">
            <p>Nenhuma meta criada ainda</p>
            <button className="btn-secondary">Criar meta</button>
          </div>
        </div>
      </Card>

      {/* Equilíbrio Financeiro */}
      <Card 
        title="Equilíbrio financeiro"
        actions={<a href="#" className="link-secondary">Saiba mais</a>}
      >
        <div className="equilibrio">
          <div className="equilibrio-item">
            <div className="equilibrio-label">Gastos essenciais</div>
            <div className="equilibrio-info">
              <div className="equilibrio-valor">R$ 0,00</div>
              <div className="equilibrio-limite">Limite recomendado: R$ 0,00</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
