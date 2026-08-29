import type { Lancamento, Categoria } from '@/types';
import { formatCurrency } from '@/utils';
import { iconMap } from '@/utils/iconMap';
import styles from './Relatorios.module.css';

interface ListaMaioresGastosProps {
  lancamentos: Lancamento[];
  categorias: Categoria[];
}

export function ListaMaioresGastos({ lancamentos, categorias }: ListaMaioresGastosProps) {
  if (lancamentos.length === 0) {
    return <div className={styles.chartEmpty}>Nenhum gasto no mês selecionado.</div>;
  }

  return (
    <div>
      {lancamentos.map((lanc) => {
        const categoria = categorias.find((c) => c.id === lanc.categoriaId);
        const IconComponent = categoria?.icone ? iconMap[categoria.icone] : null;
        const dataObj = lanc.data instanceof Date ? lanc.data : new Date(lanc.data);
        const dataFormatada = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

        return (
          <div key={lanc.id} className={styles.listaRow}>
            <div className={styles.listaIcon}>{IconComponent ? <IconComponent size={17} /> : null}</div>
            <div className={styles.listaText}>
              <div className={styles.listaTitle}>{lanc.descricao || categoria?.nome || 'Sem descrição'}</div>
              <div className={styles.listaSub}>{dataFormatada}</div>
            </div>
            <div className={styles.listaValue}>{formatCurrency(lanc.valor)}</div>
          </div>
        );
      })}
    </div>
  );
}
