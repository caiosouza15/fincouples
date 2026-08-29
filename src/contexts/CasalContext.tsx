import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { isApiConfigured } from '@/data/config';
import { supabase, getCasalSession } from '@/data/sources/supabase';

const STORAGE_KEY = 'fincouples_casal_nomes';

interface CasalContextType {
  usuario1Nome: string;
  usuario2Nome: string;
  /** Qual dos dois "eu" sou. No mock não existe essa noção — fica sempre 'usuario1'. */
  meuPessoaId: 'usuario1' | 'usuario2';
  /** No Supabase, false até o parceiro aceitar o convite. No mock, sempre true. */
  parceiroJaEntrou: boolean;
  loading: boolean;
  setUsuario1Nome: (nome: string) => void;
  setUsuario2Nome: (nome: string) => void;
  getNomePessoa: (pessoaId?: 'usuario1' | 'usuario2') => string;
}

const CasalContext = createContext<CasalContextType | undefined>(undefined);

function loadNomesMock(): { usuario1: string; usuario2: string } {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        usuario1: parsed.usuario1 ?? 'Pessoa 1',
        usuario2: parsed.usuario2 ?? 'Pessoa 2',
      };
    }
  } catch {
    /* ignore */
  }
  return { usuario1: 'Pessoa 1', usuario2: 'Pessoa 2' };
}

function saveNomesMock(usuario1: string, usuario2: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ usuario1, usuario2 }));
  } catch {
    console.error('Erro ao salvar nomes do casal');
  }
}

export function CasalProvider({ children }: { children: ReactNode }) {
  const supabaseMode = isApiConfigured();
  const [nomes, setNomes] = useState(() =>
    supabaseMode ? { usuario1: '', usuario2: '' } : loadNomesMock()
  );
  const [meuPessoaId, setMeuPessoaId] = useState<'usuario1' | 'usuario2'>('usuario1');
  const [parceiroJaEntrou, setParceiroJaEntrou] = useState(!supabaseMode);
  const [loading, setLoading] = useState(supabaseMode);

  useEffect(() => {
    if (!supabaseMode) return;
    let ativo = true;

    getCasalSession()
      .then((session) => {
        if (!ativo) return;
        setNomes({ usuario1: session.usuario1Nome, usuario2: session.usuario2Nome });
        setMeuPessoaId(session.pessoaId);
        setParceiroJaEntrou(session.parceiroJaEntrou);
      })
      .catch(() => {
        // Sem sessão/casal ainda — o AuthGate cuida de levar pro login/onboarding.
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });

    return () => {
      ativo = false;
    };
  }, [supabaseMode]);

  useEffect(() => {
    if (supabaseMode) return;
    saveNomesMock(nomes.usuario1, nomes.usuario2);
  }, [supabaseMode, nomes.usuario1, nomes.usuario2]);

  const atualizarMeuNomeNoBanco = async (nome: string) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    await supabase.from('perfis').update({ nome }).eq('id', data.user.id);
  };

  const setUsuario1Nome = (nome: string) => {
    if (supabaseMode) {
      if (meuPessoaId !== 'usuario1') return; // não posso editar o nome do parceiro
      void atualizarMeuNomeNoBanco(nome);
    }
    setNomes((prev) => ({ ...prev, usuario1: nome }));
  };

  const setUsuario2Nome = (nome: string) => {
    if (supabaseMode) {
      if (meuPessoaId !== 'usuario2') return;
      void atualizarMeuNomeNoBanco(nome);
    }
    setNomes((prev) => ({ ...prev, usuario2: nome }));
  };

  const getNomePessoa = (pessoaId?: 'usuario1' | 'usuario2'): string => {
    if (pessoaId === 'usuario1') return nomes.usuario1;
    if (pessoaId === 'usuario2') return nomes.usuario2;
    return nomes.usuario1;
  };

  return (
    <CasalContext.Provider
      value={{
        usuario1Nome: nomes.usuario1,
        usuario2Nome: nomes.usuario2,
        meuPessoaId,
        parceiroJaEntrou,
        loading,
        setUsuario1Nome,
        setUsuario2Nome,
        getNomePessoa,
      }}
    >
      {children}
    </CasalContext.Provider>
  );
}

export function useCasal(): CasalContextType {
  const ctx = useContext(CasalContext);
  if (!ctx) {
    throw new Error('useCasal deve ser usado dentro de CasalProvider');
  }
  return ctx;
}
