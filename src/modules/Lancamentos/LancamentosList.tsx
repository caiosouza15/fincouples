import { useState, useMemo } from 'react';
import type { Lancamento } from '@/types';
import { LancamentoItem } from './LancamentoItem';
import { EmptyState } from '@/components/EmptyState';
import { useCasal } from '@/hooks/useCasal';
import { useCategorias } from '@/hooks/useCategorias';
import { Search, ChevronDown, ArrowUpDown } from 'lucide-react';
import { Receipt } from 'lucide-react';

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

  // Função para agrupar por data
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
        // Verificar se é desta semana
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());

        if (data >= inicioSemana) {
          grupo = 'Esta Semana';
        } else {
          // Verificar se é deste mês
          if (data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear()) {
            grupo = 'Este Mês';
          } else {
            grupo = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            grupo = grupo.charAt(0).toUpperCase() + grupo.slice(1);
          }
        }
      }

      if (!grupos[grupo]) {
        grupos[grupo] = [];
      }
      grupos[grupo].push(lancamento);
    });

    return grupos;
  };

  // Filtrar e ordenar lançamentos
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

  // Agrupar por data
  const grupos = useMemo(() => {
    return agruparPorData(lancamentosFiltrados);
  }, [lancamentosFiltrados]);

  // Gerar opções de meses
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
    <div className="flex flex-col gap-lg">
      {/* Filtros - uma linha */}
      <div className="flex flex-col md:flex-row gap-sm flex-wrap">
        <div className="relative flex-1 min-w-0">
          <Search size={18} strokeWidth={2} className="absolute left-md top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none shrink-0" />
          <input
            type="text"
            placeholder="Buscar por descrição ou categoria..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-md py-sm border border-border rounded-md text-sm text-text-primary bg-surface focus:outline-none focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)]"
          />
        </div>
        <div className="relative min-w-[120px]">
          <ChevronDown size={18} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none shrink-0" />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as FiltroTipo)}
            className="w-full min-h-[40px] pl-4 pr-9 py-2.5 border border-border rounded-md text-sm text-text-primary bg-surface focus:outline-none focus:border-positive appearance-none cursor-pointer"
          >
            <option value="todos">Todos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>
        </div>
        <div className="relative min-w-[120px]">
          <ChevronDown size={18} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none shrink-0" />
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as FiltroStatus)}
            className="w-full min-h-[40px] pl-4 pr-9 py-2.5 border border-border rounded-md text-sm text-text-primary bg-surface focus:outline-none focus:border-positive appearance-none cursor-pointer"
          >
            <option value="todos">Todos</option>
            <option value="pago">Pagos</option>
            <option value="pendente">Pendentes</option>
          </select>
        </div>
        <div className="relative min-w-[140px]">
          <ChevronDown size={18} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none shrink-0" />
          <select
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            className="w-full min-h-[40px] pl-4 pr-9 py-2.5 border border-border rounded-md text-sm text-text-primary bg-surface focus:outline-none focus:border-positive appearance-none cursor-pointer"
          >
            <option value="">Todos os meses</option>
            {mesesDisponiveis.map((mes) => (
              <option key={mes} value={mes}>
                {formatMesLabel(mes)}
              </option>
            ))}
          </select>
        </div>
        <div className="relative min-w-[140px]">
          <ChevronDown size={18} strokeWidth={2} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none shrink-0" />
          <select
            value={filtroPessoa}
            onChange={(e) => setFiltroPessoa(e.target.value as FiltroPessoa)}
            className="w-full min-h-[40px] pl-4 pr-9 py-2.5 border border-border rounded-md text-sm text-text-primary bg-surface focus:outline-none focus:border-positive appearance-none cursor-pointer"
          >
            <option value="todos">Todas</option>
            <option value="usuario1">{usuario1Nome}</option>
            <option value="usuario2">{usuario2Nome}</option>
          </select>
        </div>
        <div className="relative min-w-[160px]">
          <ArrowUpDown size={18} strokeWidth={2} className="absolute left-md top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none shrink-0" />
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value as OrdenacaoLancamento)}
            className="w-full pl-9 pr-md py-sm border border-border rounded-md text-sm text-text-primary bg-surface focus:outline-none focus:border-positive appearance-none cursor-pointer min-h-[40px]"
          >
            <option value="data-desc">Data (mais recente)</option>
            <option value="data-asc">Data (mais antiga)</option>
            <option value="valor-desc">Valor (maior)</option>
            <option value="valor-asc">Valor (menor)</option>
            <option value="categoria">Categoria (A-Z)</option>
          </select>
        </div>
        {temFiltroAtivo && (
          <div className="text-xs text-text-secondary flex items-center">
            {lancamentosFiltrados.length} {lancamentosFiltrados.length === 1 ? 'lançamento encontrado' : 'lançamentos encontrados'}
          </div>
        )}
      </div>

      {/* Lista agrupada */}
      {Object.keys(grupos).length === 0 ? (
        <EmptyState
          icon={<Receipt size={32} className="text-text-secondary" />}
          title="Nenhum lançamento encontrado"
          message={temFiltroAtivo ? 'Tente ajustar os filtros de busca.' : 'Nenhum lançamento com os filtros selecionados.'}
        />
      ) : (
        Object.entries(grupos)
          .sort((a, b) => {
            // Ordenar grupos: Hoje, Ontem, Esta Semana, Este Mês, depois por data
            const ordem: Record<string, number> = {
              Hoje: 0,
              Ontem: 1,
              'Esta Semana': 2,
              'Este Mês': 3,
            };
            return (ordem[a[0]] ?? 999) - (ordem[b[0]] ?? 999);
          })
          .map(([grupo, lancamentosGrupo]) => (
            <div key={grupo} className="flex flex-col gap-md">
              <h3 className="text-sm font-semibold text-text-secondary uppercase mb-xs py-xs">
                {grupo}
              </h3>
              <div className="flex flex-col gap-sm">
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
          ))
      )}
    </div>
  );
}
