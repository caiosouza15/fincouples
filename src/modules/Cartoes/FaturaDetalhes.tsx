import type { FaturaCartao, Lancamento, CartaoCredito } from '@/types';
import { formatCurrency } from '@/utils';
import { iconMap } from '@/utils/iconMap';
import { useCasal } from '@/hooks/useCasal';

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
  
  // Calcular período da fatura usando a mesma lógica do service
  const [ano, mes] = fatura.mesReferencia.split('-').map(Number);
  
  // Data de fechamento do mês atual
  const dataFechamento = new Date(ano, mes - 1, cartao.fechamento);
  
  // Data de início: fechamento do mês anterior
  const dataInicio = new Date(ano, mes - 2, cartao.fechamento);
  dataInicio.setHours(0, 0, 0, 0);
  
  // Data de fim: fechamento do mês atual (exclusivo, então -1 dia)
  const dataFim = new Date(dataFechamento);
  dataFim.setDate(dataFim.getDate() - 1);
  dataFim.setHours(23, 59, 59, 999);
  
  // Filtrar lançamentos do cartão no período da fatura
  const lancamentosFatura = lancamentos.filter(l => {
    if (l.cartaoId !== fatura.cartaoId) return false;
    
    const dataLancamento = l.data instanceof Date ? l.data : new Date(l.data);
    
    return dataLancamento >= dataInicio && dataLancamento <= dataFim;
  });

  // Agrupar por categoria
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
    return (
      <div className="p-md bg-background rounded-md text-sm text-text-secondary text-center">
        Nenhum lançamento encontrado para esta fatura.
      </div>
    );
  }

  return (
    <div className="mt-md pt-md border-t border-border">
      <div className="text-sm font-semibold text-text-primary mb-md">
        Detalhamento da Fatura ({lancamentosFatura.length} {lancamentosFatura.length === 1 ? 'lançamento' : 'lançamentos'})
      </div>
      
      <div className="flex flex-col gap-md">
        {categoriasOrdenadas.map((grupo) => {
          const IconComponent = grupo.categoriaIcone ? iconMap[grupo.categoriaIcone] : null;
          
          return (
            <div key={grupo.categoriaNome} className="bg-background rounded-md p-md">
              <div className="flex items-center justify-between mb-sm">
                <div className="flex items-center gap-sm">
                  {IconComponent && (
                    <div className="w-8 h-8 flex items-center justify-center bg-surface rounded-md text-text-secondary">
                      <IconComponent size={16} />
                    </div>
                  )}
                  <span className="text-sm font-medium text-text-primary">
                    {grupo.categoriaNome}
                  </span>
                </div>
                <span className="text-sm font-semibold text-text-primary">
                  {formatCurrency(grupo.total)}
                </span>
              </div>
              
              <div className="flex flex-col gap-xs pl-0">
                {grupo.lancamentos.map((lancamento) => {
                  const dataLancamento = lancamento.data instanceof Date 
                    ? lancamento.data 
                    : new Date(lancamento.data);
                  
                  return (
                    <div
                      key={lancamento.id}
                      className="flex items-center justify-between py-xs px-sm bg-surface rounded-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-xs">
                          <div className="text-sm text-text-primary truncate">
                            {lancamento.descricao || 'Sem descrição'}
                          </div>
                          {lancamento.pessoaId && (
                            <span className={`px-xs py-0.5 text-xs font-medium rounded-full shrink-0 ${
                              lancamento.pessoaId === 'usuario1'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {lancamento.nomePessoa || getNomePessoa(lancamento.pessoaId)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {formatDate(dataLancamento)}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-negative shrink-0 ml-sm">
                        {formatCurrency(lancamento.valor)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-md pt-md border-t border-border flex justify-between items-center">
        <span className="text-base font-semibold text-text-primary">Total da Fatura:</span>
        <span className="text-lg font-bold text-text-primary">
          {formatCurrency(fatura.valorTotal)}
        </span>
      </div>
    </div>
  );
}
