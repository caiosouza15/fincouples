import { supabase } from './client';

export interface CasalSession {
  casalId: string;
  pessoaId: 'usuario1' | 'usuario2';
  usuario1Nome: string;
  usuario2Nome: string;
  parceiroJaEntrou: boolean;
}

let cached: CasalSession | null = null;
let inFlight: Promise<CasalSession> | null = null;

// Invalida o cache sempre que a sessão muda (login/logout/troca de usuário).
supabase.auth.onAuthStateChange(() => {
  cached = null;
  inFlight = null;
});

// Resolve, uma vez por sessão, a que casal o usuário logado pertence e se
// ele é "usuario1" ou "usuario2" — os DataSource do Supabase usam isso pra
// preencher casal_id/pessoa_id nos inserts (nunca confiar em casalId vindo
// do payload do cliente) e pra exibir nomeProprietario/nomePessoa sem
// depender do CasalContext antigo (que ainda vive só em localStorage).
export async function getCasalSession(): Promise<CasalSession> {
  if (cached) return cached;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error('Usuário não autenticado');
    }
    const userId = userData.user.id;

    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('casal_id')
      .eq('id', userId)
      .single();
    if (perfilError || !perfil) {
      throw new Error('Perfil não encontrado — crie ou aceite um convite de casal primeiro');
    }

    const { data: casal, error: casalError } = await supabase
      .from('casais')
      .select('usuario1_id, usuario2_id')
      .eq('id', perfil.casal_id)
      .single();
    if (casalError || !casal) {
      throw new Error('Casal não encontrado');
    }

    const { data: perfis, error: perfisError } = await supabase
      .from('perfis')
      .select('id, nome')
      .eq('casal_id', perfil.casal_id);
    if (perfisError) {
      throw new Error('Erro ao buscar nomes do casal');
    }

    const nomeById = new Map((perfis ?? []).map((p) => [p.id, p.nome]));

    const session: CasalSession = {
      casalId: perfil.casal_id,
      pessoaId: userId === casal.usuario1_id ? 'usuario1' : 'usuario2',
      usuario1Nome: nomeById.get(casal.usuario1_id) ?? 'Pessoa 1',
      usuario2Nome: casal.usuario2_id ? (nomeById.get(casal.usuario2_id) ?? 'Pessoa 2') : 'Pessoa 2',
      parceiroJaEntrou: casal.usuario2_id !== null,
    };
    cached = session;
    return session;
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}

export function nomeDaPessoa(
  pessoaId: string | null | undefined,
  session: CasalSession
): string | undefined {
  if (pessoaId === 'usuario1') return session.usuario1Nome;
  if (pessoaId === 'usuario2') return session.usuario2Nome;
  return undefined;
}
