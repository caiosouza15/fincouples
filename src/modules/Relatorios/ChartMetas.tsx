/**
 * Bloco de progresso das metas.
 * Exibe empty state até existir MetasContext ou serviço de metas.
 * Quando houver dados: barras de progresso (valorAtual / valorObjetivo) por meta.
 */
export function ChartMetas() {
  return (
    <div className="flex flex-col items-center justify-center py-xl text-center text-text-secondary">
      <p className="mb-sm">Nenhuma meta configurada.</p>
      <p className="text-sm">Configure suas metas no módulo Metas para ver o progresso aqui.</p>
    </div>
  );
}
