import { useState, type FormEvent } from 'react';
import { supabase } from '@/data/sources/supabase';
import { Logo } from '@/components/Logo';

type Mode = 'escolha' | 'criar' | 'convite' | 'convite-criado';

const inputClass =
  'p-md border rounded-md text-base text-text-primary bg-surface border-border transition-colors duration-200 focus:outline-none focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] disabled:opacity-60';

const buttonClass =
  'p-md rounded-md bg-primary text-primary-foreground font-medium transition-opacity duration-200 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed';

interface OnboardingProps {
  nomeInicial: string;
  onConcluido: () => void;
}

// Depois da confirmação de e-mail, o usuário tem sessão mas ainda não tem
// perfil/casal. Esse passo cria o casal (criar_casal) ou entra num
// existente via convite (aceitar_convite).
export function Onboarding({ nomeInicial, onConcluido }: OnboardingProps) {
  const tokenDaUrl = new URLSearchParams(window.location.search).get('convite') ?? '';
  const [mode, setMode] = useState<Mode>(tokenDaUrl ? 'convite' : 'escolha');
  const [nome, setNome] = useState(nomeInicial);
  const [token, setToken] = useState(tokenDaUrl);
  const [conviteLink, setConviteLink] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCriar = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error: rpcError } = await supabase.rpc('criar_casal', { p_nome: nome.trim() });
      if (rpcError) throw rpcError;
      const conviteToken = data?.convite_token;
      if (conviteToken) {
        setConviteLink(`${window.location.origin}${window.location.pathname}?convite=${conviteToken}`);
        setMode('convite-criado');
      } else {
        onConcluido();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar casal');
    } finally {
      setLoading(false);
    }
  };

  const handleCopiar = async () => {
    await navigator.clipboard.writeText(conviteLink);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleAceitar = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const tokenLimpo = token.trim();
      if (!tokenLimpo) throw new Error('Cole o link ou código do convite');
      const { error: rpcError } = await supabase.rpc('aceitar_convite', {
        p_token: tokenLimpo,
        p_nome: nome.trim(),
      });
      if (rpcError) throw rpcError;
      onConcluido();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao aceitar convite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-lg">
      <Logo variant="vertical" size={40} className="mb-lg" />
      <div className="max-w-sm w-full bg-surface border border-border rounded-md p-lg flex flex-col gap-md">
        <h1 className="text-lg font-semibold text-text-primary">Falta pouco</h1>

        {mode === 'escolha' && (
          <>
            <p className="text-text-secondary text-sm">
              Você confirmou seu e-mail. Agora escolha:
            </p>
            <button className={buttonClass} onClick={() => setMode('criar')}>
              Criar nosso espaço (sou o primeiro)
            </button>
            <button
              className={`${buttonClass} bg-secondary text-secondary-foreground`}
              onClick={() => setMode('convite')}
            >
              Tenho um convite do meu parceiro(a)
            </button>
          </>
        )}

        {mode === 'criar' && (
          <form onSubmit={handleCriar} className="flex flex-col gap-md">
            <input
              className={inputClass}
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={loading}
              required
            />
            {error && <p className="text-negative text-sm">{error}</p>}
            <button type="submit" className={buttonClass} disabled={loading}>
              {loading ? 'Aguarde...' : 'Criar'}
            </button>
            <button type="button" className="text-sm text-text-secondary" onClick={() => setMode('escolha')}>
              Voltar
            </button>
          </form>
        )}

        {mode === 'convite-criado' && (
          <div className="flex flex-col gap-md">
            <p className="text-text-secondary text-sm">
              Espaço criado. Envie esse link pro seu parceiro(a) entrar — ele vale por 48 horas.
            </p>
            <button type="button" className={buttonClass} onClick={handleCopiar}>
              {copiado ? 'Copiado!' : 'Copiar link do convite'}
            </button>
            <button type="button" className={`${buttonClass} bg-secondary text-secondary-foreground`} onClick={onConcluido}>
              Continuar sem convidar agora
            </button>
          </div>
        )}

        {mode === 'convite' && (
          <form onSubmit={handleAceitar} className="flex flex-col gap-md">
            <input
              className={inputClass}
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={loading}
              required
            />
            <input
              className={inputClass}
              type="text"
              placeholder="Código do convite"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={loading}
              required
            />
            {error && <p className="text-negative text-sm">{error}</p>}
            <button type="submit" className={buttonClass} disabled={loading}>
              {loading ? 'Aguarde...' : 'Entrar no casal'}
            </button>
            <button type="button" className="text-sm text-text-secondary" onClick={() => setMode('escolha')}>
              Voltar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
