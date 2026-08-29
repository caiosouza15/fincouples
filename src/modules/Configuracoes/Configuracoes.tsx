import { useState } from 'react';
import { usePrivacy } from '@/hooks/usePrivacy';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { useContas } from '@/hooks/useContas';
import { useCategorias } from '@/hooks/useCategorias';
import { useCartoes } from '@/hooks/useCartoes';
import type { Conta } from '@/types';
import type { Categoria } from '@/types';
import type { CartaoCredito } from '@/types';
import { ContasList } from './Contas/ContasList';
import { ContaForm } from './Contas/ContaForm';
import { CategoriasList, CategoriaForm } from './Categorias';
import { CartoesList, CartaoForm } from './Cartoes';
import { CasalConfig } from './Casal/CasalConfig';

type TabType = 'contas' | 'categorias' | 'cartoes' | 'casal';
type FiltroTipoCategoria = 'todas' | 'receita' | 'despesa';

const Configuracoes = () => {
  const [activeTab, setActiveTab] = useState<TabType>('contas');
  const { contas, addConta, editConta, removeConta } = useContas();
  const { categorias, addCategoria, editCategoria, removeCategoria, isPadrao } = useCategorias();
  const { cartoes, addCartao, editCartao, removeCartao, toggleCartaoAtivo } = useCartoes();
  
  // Estados para Contas
  const { hidePoupancaInvestimento, setHidePoupancaInvestimento } = usePrivacy();
  const [showFormConta, setShowFormConta] = useState(false);
  const [contaEditando, setContaEditando] = useState<Conta | null>(null);
  
  // Estados para Categorias
  const [filtroTipoCategoria, setFiltroTipoCategoria] = useState<FiltroTipoCategoria>('todas');
  const [showFormCategoria, setShowFormCategoria] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);

  // Estados para Cartões
  const [showFormCartao, setShowFormCartao] = useState(false);
  const [cartaoEditando, setCartaoEditando] = useState<CartaoCredito | null>(null);

  // Handlers para Contas
  const handleAddConta = () => {
    setContaEditando(null);
    setShowFormConta(true);
  };

  const handleEditConta = (conta: Conta) => {
    setContaEditando(conta);
    setShowFormConta(true);
  };

  const handleSaveConta = async (contaData: Omit<Conta, 'id'> | Conta) => {
    if ('id' in contaData) {
      await editConta(contaData.id, contaData);
    } else {
      await addConta(contaData);
    }
    setShowFormConta(false);
    setContaEditando(null);
  };

  const handleDeleteConta = async (id: string) => {
    await removeConta(id);
  };

  const handleCloseFormConta = () => {
    setShowFormConta(false);
    setContaEditando(null);
  };

  // Handlers para Categorias
  const handleAddCategoria = () => {
    setCategoriaEditando(null);
    setShowFormCategoria(true);
  };

  const handleEditCategoria = (categoria: Categoria) => {
    setCategoriaEditando(categoria);
    setShowFormCategoria(true);
  };

  const handleSaveCategoria = async (data: Omit<Categoria, 'id'> | Categoria) => {
    if ('id' in data) {
      await editCategoria(data.id, data);
    } else {
      await addCategoria(data);
    }
    setShowFormCategoria(false);
    setCategoriaEditando(null);
  };

  const handleDeleteCategoria = async (id: string) => {
    await removeCategoria(id);
  };

  const handleCloseFormCategoria = () => {
    setShowFormCategoria(false);
    setCategoriaEditando(null);
  };

  // Handlers para Cartões
  const handleAddCartao = () => {
    setCartaoEditando(null);
    setShowFormCartao(true);
  };

  const handleEditCartao = (cartao: CartaoCredito) => {
    setCartaoEditando(cartao);
    setShowFormCartao(true);
  };

  const handleSaveCartao = async (cartaoData: Omit<CartaoCredito, 'id'> | CartaoCredito) => {
    if ('id' in cartaoData) {
      await editCartao(cartaoData.id, cartaoData);
    } else {
      await addCartao(cartaoData);
    }
    setShowFormCartao(false);
    setCartaoEditando(null);
  };

  const handleDeleteCartao = async (id: string) => {
    await removeCartao(id);
  };

  const handleCloseFormCartao = () => {
    setShowFormCartao(false);
    setCartaoEditando(null);
  };

  return (
    <div className="pb-xl">
      <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-lg">Configurações</h1>

      {/* Sistema de Abas */}
      <div className="flex border-b border-border mb-md">
        <button
          onClick={() => setActiveTab('contas')}
          className={`px-lg py-md text-base font-medium transition-colors duration-200 border-b-2 ${
            activeTab === 'contas'
              ? 'border-positive text-positive'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Contas
        </button>
        <button
          onClick={() => setActiveTab('categorias')}
          className={`px-lg py-md text-base font-medium transition-colors duration-200 border-b-2 ${
            activeTab === 'categorias'
              ? 'border-positive text-positive'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Categorias
        </button>
        <button
          onClick={() => setActiveTab('cartoes')}
          className={`px-lg py-md text-base font-medium transition-colors duration-200 border-b-2 ${
            activeTab === 'cartoes'
              ? 'border-positive text-positive'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Cartões
        </button>
        <button
          onClick={() => setActiveTab('casal')}
          className={`px-lg py-md text-base font-medium transition-colors duration-200 border-b-2 ${
            activeTab === 'casal'
              ? 'border-positive text-positive'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Casal
        </button>
      </div>

      {/* Conteúdo da Aba Contas */}
      {activeTab === 'contas' && (
        <Card
          title="Minhas contas"
          actions={
            <label className="flex items-center gap-sm text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={hidePoupancaInvestimento}
                onChange={(e) => setHidePoupancaInvestimento(e.target.checked)}
              />
              <span className="text-xs">Esconder saldos das contas</span>
            </label>
          }
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
            <>
              <ContasList
                contas={contas}
                hidePoupancaInvestimento={hidePoupancaInvestimento}
                onEdit={handleEditConta}
                onDelete={handleDeleteConta}
              />
              <div className="mt-md">
                <button
                  className="bg-transparent text-text-primary border border-border py-sm px-md rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-background"
                  onClick={handleAddConta}
                >
                  + Adicionar conta
                </button>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Conteúdo da Aba Categorias */}
      {activeTab === 'categorias' && (
        <Card
          title="Minhas categorias"
          actions={
            <select
              className="p-sm border border-border rounded-md text-sm font-inherit text-text-primary bg-surface focus:outline-none focus:border-positive"
              value={filtroTipoCategoria}
              onChange={(e) => setFiltroTipoCategoria(e.target.value as FiltroTipoCategoria)}
            >
              <option value="todas">Todas</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </select>
          }
        >
          {categorias.length === 0 ? (
            <EmptyState 
              hideText={true}
              actionButton={
                <button
                  className="bg-transparent text-text-primary border border-border py-sm px-md rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-background"
                  onClick={handleAddCategoria}
                >
                  Adicionar categoria
                </button>
              }
            />
          ) : (
            <>
              <CategoriasList
                categorias={categorias}
                filtroTipo={filtroTipoCategoria}
                onEdit={handleEditCategoria}
                onDelete={handleDeleteCategoria}
                isPadrao={isPadrao}
              />
              <div className="mt-md">
                <button
                  className="bg-transparent text-text-primary border border-border py-sm px-md rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-background"
                  onClick={handleAddCategoria}
                >
                  + Adicionar categoria
                </button>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Conteúdo da Aba Cartões */}
      {activeTab === 'cartoes' && (
        <Card title="Meus cartões">
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
              <CartoesList
                cartoes={cartoes}
                onEdit={handleEditCartao}
                onDelete={handleDeleteCartao}
                onToggleAtivo={toggleCartaoAtivo}
              />
              <div className="mt-md">
                <button
                  className="bg-transparent text-text-primary border border-border py-sm px-md rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-background"
                  onClick={handleAddCartao}
                >
                  + Adicionar cartão
                </button>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Conteúdo da Aba Casal */}
      {activeTab === 'casal' && <CasalConfig />}

      {/* Modais de Formulários */}
      {showFormConta && (
        <ContaForm
          conta={contaEditando}
          onClose={handleCloseFormConta}
          onSave={handleSaveConta}
        />
      )}

      {showFormCategoria && (
        <CategoriaForm
          categoria={categoriaEditando}
          onClose={handleCloseFormCategoria}
          onSave={handleSaveCategoria}
          isPadrao={isPadrao}
        />
      )}

      {showFormCartao && (
        <CartaoForm
          cartao={cartaoEditando}
          onClose={handleCloseFormCartao}
          onSave={handleSaveCartao}
        />
      )}
    </div>
  );
};

export default Configuracoes;
