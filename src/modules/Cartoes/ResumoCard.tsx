import { Card } from '@/components/Card';
import type { CartaoCredito, FaturaCartao } from '@/types';
import { formatCurrency } from '@/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ResumoCardProps {
  cartoes: CartaoCredito[];
  faturas: FaturaCartao[];
  selectedMonth: string;
}

export function ResumoCard({ cartoes, faturas }: ResumoCardProps) {
  // Calcular métricas
  const cartoesAtivos = cartoes.filter(c => c.ativo);
  
  const totalLimiteDisponivel = cartoesAtivos.reduce((sum, c) => sum + c.limiteDisponivel, 0);
  const totalLimite = cartoesAtivos.reduce((sum, c) => sum + c.limite, 0);
  
  // Filtrar faturas não pagas totalmente
  const faturasEmAberto = faturas.filter(f => f.status !== 'pago_total');
  const totalFaturasEmAberto = faturasEmAberto.reduce(
    (sum, f) => sum + (f.valorTotal - f.valorPago),
    0
  );
  
  // Próximo vencimento
  const faturasNaoPagas = faturas.filter(f => f.status !== 'pago_total');
  const proximoVencimento = faturasNaoPagas.length > 0
    ? faturasNaoPagas.reduce((proximo, atual) => {
        const vencimentoAtual = new Date(atual.dataVencimento);
        const vencimentoProximo = proximo ? new Date(proximo.dataVencimento) : null;
        if (!vencimentoProximo || vencimentoAtual < vencimentoProximo) {
          return atual;
        }
        return proximo;
      }, null as FaturaCartao | null)
    : null;

  const formatProximoVencimento = () => {
    if (!proximoVencimento) return 'Nenhuma fatura pendente';
    const data = new Date(proximoVencimento.dataVencimento);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Calcular porcentagem de uso do limite total
  const porcentagemUsoTotal = totalLimite > 0 
    ? Math.min((totalLimite - totalLimiteDisponivel) / totalLimite * 100, 100)
    : 0;

  // Calcular dias até próximo fechamento
  const calcularDiasAteFechamento = () => {
    if (!proximoVencimento) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(proximoVencimento.dataVencimento);
    vencimento.setHours(0, 0, 0, 0);
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const diasAteFechamento = calcularDiasAteFechamento();

  return (
    <Card title="Resumo">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <div className="p-md bg-background rounded-md border border-border hover:border-positive transition-colors duration-200">
          <div className="text-sm text-text-secondary uppercase mb-xs">Limite Disponível</div>
          <div className="text-2xl font-bold text-text-primary mb-xs">
            {formatCurrency(totalLimiteDisponivel)}
          </div>
          <div className="text-xs text-text-secondary mb-sm">
            de {formatCurrency(totalLimite)} total
          </div>
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                porcentagemUsoTotal >= 90
                  ? 'bg-negative'
                  : porcentagemUsoTotal >= 70
                  ? 'bg-warning'
                  : 'bg-positive'
              }`}
              style={{ width: `${porcentagemUsoTotal}%` }}
            />
          </div>
          <div className="text-xs text-text-secondary mt-xs">
            {porcentagemUsoTotal.toFixed(0)}% utilizado
          </div>
        </div>

        <div className="p-md bg-background rounded-md border border-border hover:border-negative transition-colors duration-200">
          <div className="text-sm text-text-secondary uppercase mb-xs">Faturas em Aberto</div>
          <div className="text-2xl font-bold text-negative mb-xs">
            {formatCurrency(totalFaturasEmAberto)}
          </div>
          <div className="text-xs text-text-secondary mt-xs">
            {faturasEmAberto.length} {faturasEmAberto.length === 1 ? 'fatura' : 'faturas'}
          </div>
        </div>

        <div className="p-md bg-background rounded-md border border-border hover:border-positive transition-colors duration-200">
          <div className="text-sm text-text-secondary uppercase mb-xs">Próximo Vencimento</div>
          <div className="text-lg font-semibold text-text-primary mb-xs">
            {formatProximoVencimento()}
          </div>
          {proximoVencimento && (
            <>
              <div className="text-xs text-text-secondary mb-xs">
                {formatCurrency(proximoVencimento.valorTotal - proximoVencimento.valorPago)} restante
              </div>
              {diasAteFechamento !== null && (
                <div className="flex items-center gap-xs text-xs">
                  {diasAteFechamento < 0 ? (
                    <>
                      <TrendingDown size={14} className="text-negative" />
                      <span className="text-negative font-semibold">
                        {Math.abs(diasAteFechamento)} {Math.abs(diasAteFechamento) === 1 ? 'dia' : 'dias'} atrasado
                      </span>
                    </>
                  ) : diasAteFechamento <= 7 ? (
                    <>
                      <TrendingUp size={14} className="text-warning" />
                      <span className="text-warning font-semibold">
                        Em {diasAteFechamento} {diasAteFechamento === 1 ? 'dia' : 'dias'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Minus size={14} className="text-text-secondary" />
                      <span className="text-text-secondary">
                        Em {diasAteFechamento} dias
                      </span>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
