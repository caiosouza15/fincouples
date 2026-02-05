import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { FaturaCartao } from '@/types';
import {
  getFaturas,
  getFaturaPorMes,
  updateFatura,
  gerarFaturaAutomatica,
} from '@/services/faturasService';

interface FaturasContextType {
  faturas: FaturaCartao[];
  loading: boolean;
  error: string | null;
  fetchFaturas: () => Promise<void>;
  getFaturaAtual: (cartaoId: string, mesReferencia: string) => Promise<FaturaCartao | null>;
  marcarFaturaComoPaga: (faturaId: string, valorPago?: number) => Promise<void>;
  gerarFaturasAutomaticas: (mesReferencia: string) => Promise<void>;
  getFaturasPorCartao: (cartaoId: string) => FaturaCartao[];
}

const FaturasContext = createContext<FaturasContextType | undefined>(undefined);

export function FaturasProvider({ children }: { children: ReactNode }) {
  const [faturas, setFaturas] = useState<FaturaCartao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFaturas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFaturas();
      setFaturas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar faturas');
      console.error('Erro ao buscar faturas:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFaturaAtual = async (
    cartaoId: string,
    mesReferencia: string
  ): Promise<FaturaCartao | null> => {
    try {
      // Primeiro tenta buscar fatura existente
      let fatura = await getFaturaPorMes(cartaoId, mesReferencia);
      
      // Se não existir, gera automaticamente
      if (!fatura) {
        fatura = await gerarFaturaAutomatica(cartaoId, mesReferencia);
        // Atualizar lista de faturas
        await fetchFaturas();
      }
      
      return fatura;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao obter fatura');
      console.error('Erro ao obter fatura:', err);
      return null;
    }
  };

  const marcarFaturaComoPaga = async (faturaId: string, valorPago?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const fatura = faturas.find(f => f.id === faturaId);
      if (!fatura) {
        throw new Error('Fatura não encontrada');
      }
      
      const novoValorPago = valorPago !== undefined ? valorPago : fatura.valorTotal;
      await updateFatura(faturaId, { valorPago: novoValorPago });
      
      // Atualizar lista
      await fetchFaturas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao marcar fatura como paga');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const gerarFaturasAutomaticas = async (_mesReferencia: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Esta função será chamada externamente com lista de cartões
      // Por enquanto, apenas atualiza a lista
      await fetchFaturas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar faturas');
      console.error('Erro ao gerar faturas:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFaturasPorCartao = (cartaoId: string): FaturaCartao[] => {
    return faturas.filter(f => f.cartaoId === cartaoId);
  };

  useEffect(() => {
    fetchFaturas();
  }, []);

  return (
    <FaturasContext.Provider
      value={{
        faturas,
        loading,
        error,
        fetchFaturas,
        getFaturaAtual,
        marcarFaturaComoPaga,
        gerarFaturasAutomaticas,
        getFaturasPorCartao,
      }}
    >
      {children}
    </FaturasContext.Provider>
  );
}

export function useFaturas() {
  const context = useContext(FaturasContext);
  if (context === undefined) {
    throw new Error('useFaturas deve ser usado dentro de um FaturasProvider');
  }
  return context;
}
