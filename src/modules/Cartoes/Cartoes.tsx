import { useState } from 'react';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { useCartoes } from '@/hooks/useCartoes';
import { useFaturas } from '@/hooks/useFaturas';
import { useSelectedMonth } from '@/contexts/SelectedMonthContext';
import type { CartaoCredito } from '@/types';
import { CartoesList } from '@/modules/Configuracoes/Cartoes/CartoesList';
import { CartaoForm } from '@/modules/Configuracoes/Cartoes/CartaoForm';
import { FaturasList } from './FaturasList';

const Cartoes = () => {
  const { cartoes, addCartao, editCartao, removeCartao, toggleCartaoAtivo } = useCartoes();
  const { faturas, marcarFaturaComoPaga } = useFaturas();
  const { selectedMonth } = useSelectedMonth();
  
  const [showForm, setShowForm] = useState(false);
  const [cartaoEditando, setCartaoEditando] = useState<CartaoCredito | null>(null);

  const handleAddCartao = () => {
    setCartaoEditando(null);
    setShowForm(true);
  };

  const handleEditCartao = (cartao: CartaoCredito) => {
    setCartaoEditando(cartao);
    setShowForm(true);
  };

  const handleSaveCartao = async (cartaoData: Omit<CartaoCredito, 'id'> | CartaoCredito) => {
    if ('id' in cartaoData) {
      await editCartao(cartaoData.id, cartaoData);
    } else {
      await addCartao(cartaoData);
    }
    setShowForm(false);
    setCartaoEditando(null);
  };

  const handleDeleteCartao = async (id: string) => {
    await removeCartao(id);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCartaoEditando(null);
  };

  const handleMarcarFaturaComoPaga = async (faturaId: string, valorPago?: number) => {
    await marcarFaturaComoPaga(faturaId, valorPago);
  };

  // Filtrar faturas do mês selecionado
  const faturasExibidas = faturas.filter(f => {
    const [ano, mes] = selectedMonth.split('-');
    return f.mesReferencia === `${ano}-${mes}`;
  });

  return (
    <div className="max-w-[1280px] mx-auto pb-xl">
      <h1 className="text-2xl font-bold text-text-primary mb-lg">Cartões de Crédito</h1>

      <Card
        title="Meus cartões"
      >
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

      {cartoes.length > 0 && faturasExibidas.length > 0 && (
        <Card
          title="Faturas"
          className="mt-lg"
        >
          <FaturasList
            faturas={faturasExibidas}
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
