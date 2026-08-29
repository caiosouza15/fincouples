import { useState, type FormEvent } from 'react';
import { supabase } from '@/data/sources/supabase';
import { Logo } from '@/components/Logo';

type Mode = 'login' | 'signup';

const inputClass =
  'p-md border rounded-md text-base text-text-primary bg-surface border-border transition-colors duration-200 focus:outline-none focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] disabled:opacity-60';

const buttonClass =
  'p-md rounded-md bg-primary text-primary-foreground font-medium transition-opacity duration-200 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed';

// Tela mínima e funcional de login/cadastro — só o necessário pra existir
// uma sessão real do Supabase. O visual definitivo (design system novo)
// fica pra quando reskinarmos este módulo, como o resto do app.
export function Auth() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupDone, setSignupDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      } else {
        if (!nome.trim()) throw new Error('Informe seu nome');
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { nome: nome.trim() } },
        });
        if (signUpError) throw signUpError;
        setSignupDone(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  if (signupDone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-lg">
        <Logo variant="vertical" size={40} className="mb-lg" />
        <div className="max-w-sm w-full text-center bg-surface border border-border rounded-md p-lg">
          <h1 className="text-lg font-semibold text-text-primary mb-sm">Confira seu e-mail</h1>
          <p className="text-text-secondary text-sm">
            Enviamos um link de confirmação para <strong>{email}</strong>. Depois de confirmar,
            volte aqui e faça login.
          </p>
          <button className={`${buttonClass} mt-lg w-full`} onClick={() => { setSignupDone(false); setMode('login'); }}>
            Voltar para o login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-lg">
      <Logo variant="vertical" size={40} className="mb-lg" />
      <form onSubmit={handleSubmit} className="max-w-sm w-full bg-surface border border-border rounded-md p-lg flex flex-col gap-md">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">
            {mode === 'login' ? 'Bem-vindo de volta' : 'Criar sua conta'}
          </h1>
          <p className="text-text-secondary text-sm mt-xs">
            {mode === 'login' ? 'Entre para continuar cuidando das finanças a dois.' : 'Comece a organizar as finanças do casal juntos.'}
          </p>
        </div>

        {mode === 'signup' && (
          <input
            className={inputClass}
            type="text"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            disabled={loading}
            required
          />
        )}

        <input
          className={inputClass}
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />

        <input
          className={inputClass}
          type="password"
          placeholder="Senha"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />

        {error && <p className="text-negative text-sm">{error}</p>}

        <button type="submit" className={buttonClass} disabled={loading}>
          {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
        </button>

        <button
          type="button"
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          disabled={loading}
        >
          {mode === 'login' ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
        </button>
      </form>
    </div>
  );
}
