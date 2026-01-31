import { useState, useMemo } from 'react';
import type { Lancamento } from '@/types';
import { LancamentoItem } from './LancamentoItem';

interface LancamentosListProps {
  lancamentos: Lancamento[];
  onEdit: (lancamento: Lancamento) => void;
  onDelete: (id: string) => void;
  onTogglePago: (id: string) => void;
}

type FiltroTipo = 'todos' | 'receita' | 'despesa';
type FiltroStatus = 'todos' | 'pago' | 'pendente';

export function LancamentosList({
  lancamentos,
  onEdit,
  onDelete,
  onTogglePago,
}: LancamentosListProps) {
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos');
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todos');
  const [filtroMes, setFiltroMes] = useState<string>('');

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

  // Filtrar lançamentos
  const lancamentosFiltrados = useMemo(() => {
    let filtrados = [...lancamentos];

    // Filtro por tipo
    if (filtroTipo !== 'todos') {
      filtrados = filtrados.filter((l) => l.tipo === filtroTipo);
    }

    // Filtro por status
    if (filtroStatus !== 'todos') {
      filtrados = filtrados.filter((l) =>
        filtroStatus === 'pago' ? l.pago : !l.pago
      );
    }

    // Filtro por mês
    if (filtroMes) {
      filtrados = filtrados.filter((l) => {
        const data = new Date(l.data);
        const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        return mes === filtroMes;
      });
    }

    return filtrados;
  }, [lancamentos, filtroTipo, filtroStatus, filtroMes]);

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

  if (lancamentos.length === 0) {
    return (
      <div className="text-center py-xl text-text-muted">
        <p>Nenhum lançamento cadastrado ainda</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-lg">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-md p-md bg-background rounded-md border border-border">
        <div className="flex flex-col gap-xs flex-1">
          <label className="text-sm font-medium text-text-primary">Tipo</label>
          <select
            className="p-sm border border-border rounded-md text-sm font-inherit text-text-primary bg-surface focus:outline-none focus:border-positive"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as FiltroTipo)}
          >
            <option value="todos">Todos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>
        </div>

        <div className="flex flex-col gap-xs flex-1">
          <label className="text-sm font-medium text-text-primary">Status</label>
          <select
            className="p-sm border border-border rounded-md text-sm font-inherit text-text-primary bg-surface focus:outline-none focus:border-positive"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as FiltroStatus)}
          >
            <option value="todos">Todos</option>
            <option value="pago">Pagos</option>
            <option value="pendente">Pendentes</option>
          </select>
        </div>

        <div className="flex flex-col gap-xs flex-1">
          <label className="text-sm font-medium text-text-primary">Mês</label>
          <select
            className="p-sm border border-border rounded-md text-sm font-inherit text-text-primary bg-surface focus:outline-none focus:border-positive"
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
          >
            <option value="">Todos os meses</option>
            {mesesDisponiveis.map((mes) => (
              <option key={mes} value={mes}>
                {formatMesLabel(mes)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista agrupada */}
      {Object.keys(grupos).length === 0 ? (
        <div className="text-center py-xl text-text-muted">
          <p>Nenhum lançamento encontrado com os filtros selecionados</p>
        </div>
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
                  />
                ))}
              </div>
            </div>
          ))
      )}
    </div>
  );
}
