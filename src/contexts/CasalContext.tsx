import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

const STORAGE_KEY = 'fincouples_casal_config';

interface CasalConfig {
  usuario1Nome: string;
  usuario2Nome: string;
}

interface CasalContextType {
  usuario1Nome: string;
  usuario2Nome: string;
  setUsuario1Nome: (nome: string) => void;
  setUsuario2Nome: (nome: string) => void;
  getNomePessoa: (pessoaId: 'usuario1' | 'usuario2') => string;
  getPessoaId: (nome: string) => 'usuario1' | 'usuario2' | null;
}

const CasalContext = createContext<CasalContextType | undefined>(undefined);

const DEFAULT_CONFIG: CasalConfig = {
  usuario1Nome: 'Usuario 1',
  usuario2Nome: 'Usuario 2',
};

function loadFromStorage(): CasalConfig {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        usuario1Nome: parsed.usuario1Nome || DEFAULT_CONFIG.usuario1Nome,
        usuario2Nome: parsed.usuario2Nome || DEFAULT_CONFIG.usuario2Nome,
      };
    }
  } catch (error) {
    console.error('Erro ao carregar configuração do casal:', error);
  }
  return DEFAULT_CONFIG;
}

function saveToStorage(config: CasalConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Erro ao salvar configuração do casal:', error);
  }
}

export function CasalProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<CasalConfig>(loadFromStorage);

  useEffect(() => {
    saveToStorage(config);
  }, [config]);

  const setUsuario1Nome = useCallback((nome: string) => {
    if (nome.trim().length < 2) {
      throw new Error('Nome deve ter pelo menos 2 caracteres');
    }
    if (nome.trim().length > 50) {
      throw new Error('Nome deve ter no máximo 50 caracteres');
    }
    setConfig((prev) => ({ ...prev, usuario1Nome: nome.trim() }));
  }, []);

  const setUsuario2Nome = useCallback((nome: string) => {
    if (nome.trim().length < 2) {
      throw new Error('Nome deve ter pelo menos 2 caracteres');
    }
    if (nome.trim().length > 50) {
      throw new Error('Nome deve ter no máximo 50 caracteres');
    }
    setConfig((prev) => ({ ...prev, usuario2Nome: nome.trim() }));
  }, []);

  const getNomePessoa = useCallback(
    (pessoaId: 'usuario1' | 'usuario2'): string => {
      return pessoaId === 'usuario1' ? config.usuario1Nome : config.usuario2Nome;
    },
    [config]
  );

  const getPessoaId = useCallback(
    (nome: string): 'usuario1' | 'usuario2' | null => {
      const nomeTrimmed = nome.trim();
      if (nomeTrimmed === config.usuario1Nome) return 'usuario1';
      if (nomeTrimmed === config.usuario2Nome) return 'usuario2';
      return null;
    },
    [config]
  );

  return (
    <CasalContext.Provider
      value={{
        usuario1Nome: config.usuario1Nome,
        usuario2Nome: config.usuario2Nome,
        setUsuario1Nome,
        setUsuario2Nome,
        getNomePessoa,
        getPessoaId,
      }}
    >
      {children}
    </CasalContext.Provider>
  );
}

export function useCasal() {
  const context = useContext(CasalContext);
  if (context === undefined) {
    throw new Error('useCasal deve ser usado dentro de um CasalProvider');
  }
  return context;
}
