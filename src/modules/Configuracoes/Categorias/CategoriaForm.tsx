import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Categoria } from '@/types';

interface CategoriaFormProps {
  categoria?: Categoria | null;
  onClose: () => void;
  onSave: (categoria: Omit<Categoria, 'id'> | Categoria) => Promise<void>;
  isPadrao?: (id: string) => boolean;
}

const CORES_PADRAO = [
  '#22c55e',
  '#ef4444',
  '#f97316',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#64748b',
];

export function CategoriaForm({ categoria, onClose, onSave, isPadrao }: CategoriaFormProps) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<Categoria['tipo']>('despesa');
  const [cor, setCor] = useState(CORES_PADRAO[0]);
  const [icone, setIcone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!categoria;
  const tipoBloqueado = isEditMode && categoria && isPadrao?.(categoria.id);

  useEffect(() => {
    if (categoria) {
      setNome(categoria.nome);
      setTipo(categoria.tipo);
      setCor(categoria.cor ?? CORES_PADRAO[0]);
      setIcone(categoria.icone ?? '');
    }
  }, [categoria]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nome.trim()) {
      setError('Nome da categoria é obrigatório');
      return;
    }

    try {
      setLoading(true);

      const categoriaData: Omit<Categoria, 'id'> | Categoria =
        isEditMode && categoria
          ? {
              ...categoria,
              nome: nome.trim(),
              tipo,
              cor: cor || undefined,
              icone: icone.trim() || undefined,
            }
          : {
              nome: nome.trim(),
              tipo,
              cor: cor || undefined,
              icone: icone.trim() || undefined,
            };

      await onSave(categoriaData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-[1000] p-md animate-[fadeIn_0.2s_ease]"
      onClick={handleClose}
    >
      <div
        className="bg-surface rounded-lg w-full max-w-[500px] max-h-[90vh] overflow-y-auto shadow-lg animate-[slideUp_0.3s_ease] md:rounded-lg md:max-w-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-lg border-b border-border">
          <h3 className="text-xl font-semibold text-text-primary m-0">
            {isEditMode ? 'Editar Categoria' : 'Nova Categoria'}
          </h3>
          <button
            className="w-8 h-8 flex items-center justify-center bg-transparent border-none rounded-sm cursor-pointer text-text-secondary transition-all duration-200 hover:bg-background hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleClose}
            aria-label="Fechar"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-lg flex flex-col gap-md">
          {error && (
            <div
              className="p-md bg-[#fee2e2] border border-negative rounded-md text-negative text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-xs">
            <label htmlFor="categoria-nome" className="text-sm font-medium text-text-primary">
              Nome da categoria *
            </label>
            <input
              id="categoria-nome"
              type="text"
              className="p-md border border-border rounded-md text-base font-inherit text-text-primary bg-surface transition-colors duration-200 focus:outline-none focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] disabled:opacity-60 disabled:cursor-not-allowed"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Alimentação, Transporte"
              required
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label htmlFor="categoria-tipo" className="text-sm font-medium text-text-primary">
              Tipo *
            </label>
            <select
              id="categoria-tipo"
              className="p-md border border-border rounded-md text-base font-inherit text-text-primary bg-surface transition-colors duration-200 focus:outline-none focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] disabled:opacity-60 disabled:cursor-not-allowed"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as Categoria['tipo'])}
              required
              disabled={loading || tipoBloqueado}
            >
              <option value="despesa">Despesa</option>
              <option value="receita">Receita</option>
            </select>
            {tipoBloqueado && (
              <span className="text-xs text-text-muted">
                O tipo não pode ser alterado em categorias padrão.
              </span>
            )}
          </div>

          <div className="flex flex-col gap-xs">
            <label className="text-sm font-medium text-text-primary">Cor</label>
            <div className="flex flex-wrap gap-sm items-center">
              {CORES_PADRAO.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-positive"
                  style={{
                    backgroundColor: c,
                    borderColor: cor === c ? '#1e293b' : 'transparent',
                  }}
                  onClick={() => setCor(c)}
                  aria-label={`Cor ${c}`}
                />
              ))}
              <input
                type="color"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                className="w-8 h-8 rounded-full border-0 cursor-pointer p-0 bg-transparent"
                title="Escolher cor"
              />
            </div>
          </div>

          <div className="flex flex-col gap-xs">
            <label htmlFor="categoria-icone" className="text-sm font-medium text-text-primary">
              Icone (nome do icone)
            </label>
            <input
              id="categoria-icone"
              type="text"
              className="p-md border border-border rounded-md text-base font-inherit text-text-primary bg-surface transition-colors duration-200 focus:outline-none focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] disabled:opacity-60 disabled:cursor-not-allowed"
              value={icone}
              onChange={(e) => setIcone(e.target.value)}
              placeholder="Ex: alimentacao, salario"
              maxLength={4}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col-reverse md:flex-row gap-md justify-end mt-md pt-md border-t border-border">
            <button
              type="button"
              className="py-md px-lg rounded-md text-base font-medium cursor-pointer transition-all duration-200 border-none bg-surface text-text-primary border border-border hover:bg-background disabled:opacity-60 disabled:cursor-not-allowed md:w-auto w-full"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-md px-lg rounded-md text-base font-medium cursor-pointer transition-all duration-200 border-none bg-positive text-white hover:bg-[#16a34a] disabled:opacity-60 disabled:cursor-not-allowed md:w-auto w-full"
              disabled={loading}
            >
              {loading ? 'Salvando...' : isEditMode ? 'Salvar' : 'Criar Categoria'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
