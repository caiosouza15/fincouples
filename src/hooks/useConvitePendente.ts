import { useEffect, useState } from 'react';
import { isApiConfigured } from '@/data/config';
import { supabase, getCasalSession } from '@/data/sources/supabase';

interface ConviteState {
  token: string;
  expiraEm: string | null;
}

// Estado do convite pendente do casal (token + validade), compartilhado
// entre o aviso do Dashboard e a tela de Configurações > Casal — evita
// duas implementações da mesma busca/regeneração.
export function useConvitePendente() {
  const [convite, setConvite] = useState<ConviteState | null>(null);
  const [carregado, setCarregado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!isApiConfigured()) {
      setCarregado(true);
      return;
    }
    let ativo = true;

    (async () => {
      try {
        const session = await getCasalSession();
        const { data } = await supabase
          .from('casais')
          .select('usuario2_id, convite_token, convite_expira_em')
          .eq('id', session.casalId)
          .single();
        if (!ativo || !data) return;
        if (!data.usuario2_id && data.convite_token) {
          setConvite({ token: data.convite_token, expiraEm: data.convite_expira_em });
        }
      } finally {
        if (ativo) setCarregado(true);
      }
    })();

    return () => {
      ativo = false;
    };
  }, []);

  const link = convite ? `${window.location.origin}/?convite=${convite.token}` : null;
  const expirado = convite?.expiraEm ? new Date(convite.expiraEm) < new Date() : false;

  const copiar = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const regenerar = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('regenerar_convite');
      if (!error && data?.convite_token) {
        setConvite({ token: data.convite_token, expiraEm: data.convite_expira_em });
      }
    } finally {
      setLoading(false);
    }
  };

  return { convite, link, expirado, carregado, loading, copiado, copiar, regenerar };
}
