import { Card } from '@/components/Card';
import type { Conta } from '@/types';
import { formatCurrency, formatCurrencyWithPrivacy } from '@/utils';
import { useCasal } from '@/hooks/useCasal';
import { Wallet, Landmark, PiggyBank, TrendingUp, User } from 'lucide-react';

interface ResumoContasProps {
  contas: Conta[];
  hideSaldo?: boolean;
}

const tipoLabels: Record<Conta['tipo'], string> = {
  corrente: 'Conta Corrente',
  poupanca: 'Poupança',
  investimento: 'Investimento',
};

export function ResumoContas({ contas, hideSaldo = false }: ResumoContasProps) {
  const { usuario1Nome, usuario2Nome } = useCasal();
  const ativas = contas.filter(c => c.ativa);
  const inativas = contas.filter(c => !c.ativa);
  const saldoTotal = ativas.reduce((s, c) => s + c.saldo, 0);

  const porPessoa = {
    usuario1: ativas.filter(c => c.proprietarioId === 'usuario1').reduce((s, c) => s + c.saldo, 0),
    usuario2: ativas.filter(c => c.proprietarioId === 'usuario2').reduce((s, c) => s + c.saldo, 0),
  };
  const temProprietario = ativas.some(c => c.proprietarioId != null);

  const porTipo = {
    corrente: ativas.filter(c => c.tipo === 'corrente').reduce((s, c) => s + c.saldo, 0),
    poupanca: ativas.filter(c => c.tipo === 'poupanca').reduce((s, c) => s + c.saldo, 0),
    investimento: ativas.filter(c => c.tipo === 'investimento').reduce((s, c) => s + c.saldo, 0),
  };
  const tiposComSaldo = (['corrente', 'poupanca', 'investimento'] as const).filter(
    t => porTipo[t] !== 0 || ativas.some(c => c.tipo === t)
  );

  return (
    <Card title="Resumo">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
        <div className="p-md bg-background rounded-md border border-border">
          <div className="text-sm text-text-secondary uppercase mb-xs flex items-center gap-xs">
            <Wallet size={16} />
            Saldo total
          </div>
          <div className="text-2xl font-bold text-text-primary">
            {hideSaldo ? formatCurrencyWithPrivacy(saldoTotal, true) : formatCurrency(saldoTotal)}
          </div>
          <div className="text-xs text-text-secondary mt-xs">
            {ativas.length} {ativas.length === 1 ? 'conta ativa' : 'contas ativas'}
          </div>
        </div>

        {tiposComSaldo.length > 0 && (
          <div className="p-md bg-background rounded-md border border-border md:col-span-1">
            <div className="text-sm text-text-secondary uppercase mb-sm">Por tipo</div>
            <div className="flex flex-col gap-xs">
              {tiposComSaldo.map(tipo => (
                <div key={tipo} className="flex items-center justify-between gap-sm">
                  <span className="text-sm text-text-primary flex items-center gap-xs">
                    {tipo === 'corrente' && <Landmark size={14} className="text-text-secondary" />}
                    {tipo === 'poupanca' && <PiggyBank size={14} className="text-text-secondary" />}
                    {tipo === 'investimento' && <TrendingUp size={14} className="text-text-secondary" />}
                    {tipoLabels[tipo]}
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    {hideSaldo ? formatCurrencyWithPrivacy(porTipo[tipo], true) : formatCurrency(porTipo[tipo])}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {temProprietario && (
          <div className="p-md bg-background rounded-md border border-border">
            <div className="text-sm text-text-secondary uppercase mb-sm flex items-center gap-xs">
              <User size={14} />
              Por pessoa
            </div>
            <div className="flex flex-col gap-xs">
              <div className="flex items-center justify-between gap-sm">
                <span className="text-sm text-text-primary">{usuario1Nome}</span>
                <span className="text-sm font-medium text-text-primary">
                  {hideSaldo ? formatCurrencyWithPrivacy(porPessoa.usuario1, true) : formatCurrency(porPessoa.usuario1)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-sm">
                <span className="text-sm text-text-primary">{usuario2Nome}</span>
                <span className="text-sm font-medium text-text-primary">
                  {hideSaldo ? formatCurrencyWithPrivacy(porPessoa.usuario2, true) : formatCurrency(porPessoa.usuario2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="p-md bg-background rounded-md border border-border">
          <div className="text-sm text-text-secondary uppercase mb-xs">Contagem</div>
          <div className="text-base text-text-primary">
            <span className="font-semibold">{ativas.length}</span> ativas
            {inativas.length > 0 && (
              <> · <span className="font-semibold">{inativas.length}</span> inativas</>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
