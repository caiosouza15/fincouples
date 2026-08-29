import { useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isApiConfigured } from '@/data/config';
import { supabase } from '@/data/sources/supabase';
import { Auth } from './Auth';
import { Onboarding } from './Onboarding';
import { Splash } from '@/components/Splash';

type Status = 'loading' | 'no-session' | 'no-perfil' | 'ready';

async function temPerfil(userId: string): Promise<boolean> {
  const { data } = await supabase.from('perfis').select('id').eq('id', userId).maybeSingle();
  return Boolean(data);
}

// Só entra em ação quando o app está de fato ligado ao Supabase
// (VITE_USE_API=true). Em modo mock, deixa passar direto — não há sessão
// real pra checar.
export function AuthGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>(isApiConfigured() ? 'loading' : 'ready');
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!isApiConfigured()) return;

    let ativo = true;

    async function resolveStatus(nextSession: Session | null) {
      if (!nextSession) {
        if (ativo) {
          setSession(null);
          setStatus('no-session');
        }
        return;
      }
      const ok = await temPerfil(nextSession.user.id);
      if (ativo) {
        setSession(nextSession);
        setStatus(ok ? 'ready' : 'no-perfil');
      }
    }

    supabase.auth.getSession().then(({ data }) => resolveStatus(data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      resolveStatus(nextSession);
    });

    return () => {
      ativo = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  if (status === 'loading') {
    return <Splash status="Carregando..." />;
  }

  if (status === 'no-session') {
    return <Auth />;
  }

  if (status === 'no-perfil' && session) {
    return (
      <Onboarding
        nomeInicial={(session.user.user_metadata?.nome as string) ?? ''}
        onConcluido={() => setStatus('ready')}
      />
    );
  }

  return <>{children}</>;
}
