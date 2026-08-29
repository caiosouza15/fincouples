import { useConvitePendente } from '@/hooks/useConvitePendente';
import styles from './ConvitePendente.module.css';

// Só aparece quando o casal ainda está incompleto (usuario2 não entrou).
// Some sozinho assim que o parceiro aceita o convite.
export function ConvitePendente() {
  const { convite, carregado, expirado, loading, copiado, copiar, regenerar } = useConvitePendente();

  if (!carregado || !convite) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.text}>
        <strong className={styles.title}>
          {expirado ? 'Convite expirado' : 'Convide seu parceiro(a)'}
        </strong>
        <span className={styles.subtitle}>
          {expirado
            ? 'O link anterior não vale mais. Gere um novo pra continuar.'
            : 'Envie esse link pra ele(a) entrar no mesmo espaço.'}
        </span>
      </div>
      {!expirado && (
        <button type="button" className={styles.action} onClick={copiar}>
          {copiado ? 'Copiado!' : 'Copiar link'}
        </button>
      )}
      <button type="button" className={styles.actionSecondary} onClick={regenerar} disabled={loading}>
        {loading ? 'Gerando...' : 'Gerar novo'}
      </button>
    </div>
  );
}
