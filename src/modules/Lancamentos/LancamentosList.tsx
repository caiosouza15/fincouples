import { useState, useMemo } from 'react';
import type { Lancamento } from '@/types';
import { LancamentoItem } from './LancamentoItem';
import { useCasal } from '@/hooks/useCasal';
import { useCategorias } from '@/hooks/useCategorias';
import { Search, ChevronDown, ArrowUpDown, Receipt } from 'lucide-react';
import styles from './Lancamentos.module.css';

interface LancamentosListProps {
  lancamentos: Lancamento[];
  onEdit: (lancamento: Lancamento) => void;
  onDelete: (id: string) => void;
  onTogglePago: (id: string) => void;
  onDuplicate?: (lancamento: Lancamento) => void;
}

type FiltroTipo = 'todos' | 'receita' | 'despesa';
type FiltroStatus = 'todos' | 'pago' | 'pendente';
type FiltroPessoa = 'todos' | 'usuario1' | 'usuario2';
type OrdenacaoLancamento = 'data-desc' | 'data-asc' | 'valor-desc' | 'valor-asc' | 'categoria';

export function LancamentosList({
  lancamentos,
  onEdit,
  onDelete,
  onTogglePago,
  onDuplicate,
}: LancamentosListProps) {
  const { usuario1Nome, usuario2Nome } = useCasal();
  const { categorias } = useCategorias();
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos');
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todos');
  const [filtroMes, setFiltroMes] = useState<string>('');
  const [filtroPessoa, setFiltroPessoa] = useState<FiltroPessoa>('todos');
  const [ordenacao, setOrdenacao] = useState<OrdenacaoLancamento>('data-desc');

  const agruparPorData = (lancamentos: Lancamento[]) => {
    const grupos: Record<string, Lancamento[]> = {};

    lancamentos.forEach((lancamento) => {
      const data = new Date(lancamento.data);
      const hoje = new Date();
      const ontem = new Date(hoje);
      ontem.setDate(ontem.getDate() - 1);

      let grupo: string;

      if (data.toDateString() === hoje.toDateString()) {
        grupo = 'Hoje';
      } else if (data.toDateString() === ontem.toDateString()) {
        grupo = 'Ontem';
      } else {
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());

        if (data >= inicioSemana) {
          grupo = 'Esta Semana';
        } else if (data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear()) {
          grupo = 'Este Mês';
        } else {
          grupo = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
          grupo = grupo.charAt(0).toUpperCase() + grupo.slice(1);
        }
      }

      if (!grupos[grupo]) grupos[grupo] = [];
      grupos[grupo].push(lancamento);
    });

    return grupos;
  };

  const lancamentosFiltrados = useMemo(() => {
    let filtrados = [...lancamentos];

    if (filtroTipo !== 'todos') filtrados = filtrados.filter((l) => l.tipo === filtroTipo);
    if (filtroStatus !== 'todos') filtrados = filtrados.filter((l) => (filtroStatus === 'pago' ? l.pago : !l.pago));
    if (filtroMes) {
      filtrados = filtrados.filter((l) => {
        const data = new Date(l.data);
        const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        return mes === filtroMes;
      });
    }
    if (filtroPessoa !== 'todos') {
      filtrados = filtrados.filter((l) => (l.tipo === 'despesa' ? l.pessoaId === filtroPessoa : true));
    }

    if (busca.trim()) {
      const q = busca.toLowerCase().trim();
      filtrados = filtrados.filter((l) => {
        const cat = categorias.find((c) => c.id === l.categoriaId);
        const nomeCategoria = cat?.nome ?? '';
        return (l.descricao ?? '').toLowerCase().includes(q) || nomeCategoria.toLowerCase().includes(q);
      });
    }

    filtrados.sort((a, b) => {
      switch (ordenacao) {
        case 'data-desc':
          return new Date(b.data).getTime() - new Date(a.data).getTime();
        case 'data-asc':
          return new Date(a.data).getTime() - new Date(b.data).getTime();
        case 'valor-desc':
          return b.valor - a.valor;
        case 'valor-asc':
          return a.valor - b.valor;
        case 'categoria': {
          const catA = categorias.find((c) => c.id === a.categoriaId)?.nome ?? '';
          const catB = categorias.find((c) => c.id === b.categoriaId)?.nome ?? '';
          return catA.localeCompare(catB, 'pt-BR');
        }
        default:
          return 0;
      }
    });

    return filtrados;
  }, [lancamentos, filtroTipo, filtroStatus, filtroMes, filtroPessoa, busca, ordenacao, categorias]);

  const grupos = useMemo(() => agruparPorData(lancamentosFiltrados), [lancamentosFiltrados]);

  const mesesDisponiveis = useMemo(() => {
    const meses = new Set<string>();
    lancamentos.forEach((l) => {
      const data = new Date(l.data);
      const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      meses.add(mes);
    });
    return Array.from(meses).sort().reverse();
  }, [lancamentos]);

  const formatMesLabel = (mes: string): string => {
    const [year, month] = mes.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const temFiltroAtivo = !!busca.trim() || filtroTipo !== 'todos' || filtroStatus !== 'todos' || !!filtroMes || filtroPessoa !== 'todos';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}><Search size={16} /></span>
          <input
            type="text"
            placeholder="Buscar por descrição ou categoria..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.selectWrap}>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as FiltroTipo)} className={styles.select}>
            <option value="todos">Todos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>
          <ChevronDown size={15} className={styles.selectChevron} />
        </div>

        <div className={styles.selectWrap}>
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as FiltroStatus)} className={styles.select}>
            <option value="todos">Todos</option>
            <option value="pago">Pagos</option>
            <option value="pendente">Pendentes</option>
          </select>
          <ChevronDown size={15} className={styles.selectChevron} />
        </div>

        <div className={styles.selectWrap}>
          <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} className={styles.select}>
            <option value="">Todos os meses</option>
            {mesesDisponiveis.map((mes) => (
              <option key={mes} value={mes}>{formatMesLabel(mes)}</option>
            ))}
          </select>
          <ChevronDown size={15} className={styles.selectChevron} />
        </div>

        <div className={styles.selectWrap}>
          <select value={filtroPessoa} onChange={(e) => setFiltroPessoa(e.target.value as FiltroPessoa)} className={styles.select}>
            <option value="todos">Todas</option>
            <option value="usuario1">{usuario1Nome}</option>
            <option value="usuario2">{usuario2Nome}</option>
          </select>
          <ChevronDown size={15} className={styles.selectChevron} />
        </div>

        <div className={styles.selectWrap}>
          <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value as OrdenacaoLancamento)} className={styles.select}>
            <option value="data-desc">Data (mais recente)</option>
            <option value="data-asc">Data (mais antiga)</option>
            <option value="valor-desc">Valor (maior)</option>
            <option value="valor-asc">Valor (menor)</option>
            <option value="categoria">Categoria (A-Z)</option>
          </select>
          <ArrowUpDown size={14} className={styles.selectChevron} />
        </div>

        {temFiltroAtivo && (
          <span className={styles.resultCount}>
            {lancamentosFiltrados.length} {lancamentosFiltrados.length === 1 ? 'lançamento encontrado' : 'lançamentos encontrados'}
          </span>
        )}
      </div>

      {Object.keys(grupos).length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}><Receipt size={26} /></div>
          <div>
            <div className={styles.emptyStateTitle}>Nenhum lançamento encontrado</div>
            <div className={styles.emptyStateMessage}>
              {temFiltroAtivo ? 'Tente ajustar os filtros de busca.' : 'Nenhum lançamento com os filtros selecionados.'}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.groups}>
          {Object.entries(grupos)
            .sort((a, b) => {
              const ordem: Record<string, number> = { Hoje: 0, Ontem: 1, 'Esta Semana': 2, 'Este Mês': 3 };
              return (ordem[a[0]] ?? 999) - (ordem[b[0]] ?? 999);
            })
            .map(([grupo, lancamentosGrupo]) => (
              <div key={grupo} className={styles.group}>
                <span className={styles.sectionLabel}>{grupo}</span>
                <div className={styles.rows}>
                  {lancamentosGrupo.map((lancamento) => (
                    <LancamentoItem
                      key={lancamento.id}
                      lancamento={lancamento}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onTogglePago={onTogglePago}
                      onDuplicate={onDuplicate}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
