import type { FaturaCartao, Lancamento, CartaoCredito } from '@/types';
import { formatCurrency } from '@/utils';
import { iconMap } from '@/utils/iconMap';
import { useCasal } from '@/hooks/useCasal';
import styles from './FaturaDetalhes.module.css';

const formatDate = (date: Date) => {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

interface FaturaDetalhesProps {
  fatura: FaturaCartao;
  cartao: CartaoCredito;
  lancamentos: Lancamento[];
  categorias: Array<{ id: string; nome: string; icone?: string }>;
}

export function FaturaDetalhes({ fatura, cartao, lancamentos, categorias }: FaturaDetalhesProps) {
  const { getNomePessoa } = useCasal();

  const [ano, mes] = fatura.mesReferencia.split('-').map(Number);

  const dataFechamento = new Date(ano, mes - 1, cartao.fechamento);

  const dataInicio = new Date(ano, mes - 2, cartao.fechamento);
  dataInicio.setHours(0, 0, 0, 0);

  const dataFim = new Date(dataFechamento);
  dataFim.setDate(dataFim.getDate() - 1);
  dataFim.setHours(23, 59, 59, 999);

  const lancamentosFatura = lancamentos.filter(l => {
    if (l.cartaoId !== fatura.cartaoId) return false;
    const dataLancamento = l.data instanceof Date ? l.data : new Date(l.data);
    return dataLancamento >= dataInicio && dataLancamento <= dataFim;
  });

  const lancamentosPorCategoria = lancamentosFatura.reduce((acc, lancamento) => {
    const categoria = categorias.find(c => c.id === lancamento.categoriaId);
    const categoriaNome = categoria?.nome || 'Sem categoria';

    if (!acc[categoriaNome]) {
      acc[categoriaNome] = {
        categoriaNome,
        categoriaIcone: categoria?.icone,
        lancamentos: [],
        total: 0,
      };
    }

    acc[categoriaNome].lancamentos.push(lancamento);
    acc[categoriaNome].total += lancamento.valor;

    return acc;
  }, {} as Record<string, { categoriaNome: string; categoriaIcone?: string; lancamentos: Lancamento[]; total: number }>);

  const categoriasOrdenadas = Object.values(lancamentosPorCategoria).sort((a, b) => b.total - a.total);

  if (lancamentosFatura.length === 0) {
    return <div className={styles.empty}>Nenhum lançamento encontrado para esta fatura.</div>;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.title}>
        Detalhamento da Fatura ({lancamentosFatura.length} {lancamentosFatura.length === 1 ? 'lançamento' : 'lançamentos'})
      </div>

      <div className={styles.groups}>
        {categoriasOrdenadas.map((grupo) => {
          const IconComponent = grupo.categoriaIcone ? iconMap[grupo.categoriaIcone] : null;

          return (
            <div key={grupo.categoriaNome} className={styles.group}>
              <div className={styles.groupHeader}>
                <div className={styles.groupHeaderLeft}>
                  {IconComponent && (
                    <div className={styles.groupIcon}><IconComponent size={14} /></div>
                  )}
                  <span className={styles.groupName}>{grupo.categoriaNome}</span>
                </div>
                <span className={styles.groupTotal}>{formatCurrency(grupo.total)}</span>
              </div>

              <div className={styles.items}>
                {grupo.lancamentos.map((lancamento) => {
                  const dataLancamento = lancamento.data instanceof Date ? lancamento.data : new Date(lancamento.data);

                  return (
                    <div key={lancamento.id} className={styles.itemRow}>
                      <div className={styles.itemLeft}>
                        <div className={styles.itemTop}>
                          <span className={styles.itemDesc}>{lancamento.descricao || 'Sem descrição'}</span>
                          {lancamento.pessoaId && (
                            <span className={`${styles.itemBadge} ${lancamento.pessoaId === 'usuario2' ? styles.itemBadgeP2 : styles.itemBadgeP1}`}>
                              {lancamento.nomePessoa || getNomePessoa(lancamento.pessoaId)}
                            </span>
                          )}
                        </div>
                        <div className={styles.itemDate}>{formatDate(dataLancamento)}</div>
                      </div>
                      <span className={styles.itemValue}>{formatCurrency(lancamento.valor)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <span className={styles.footerLabel}>Total da Fatura:</span>
        <span className={styles.footerValue}>{formatCurrency(fatura.valorTotal)}</span>
      </div>
    </div>
  );
}
