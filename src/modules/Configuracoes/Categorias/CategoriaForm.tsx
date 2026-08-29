import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Categoria } from '@/types';

interface CategoriaFormProps {
  categoria?: Categoria | null;
  onClose: () => void;
  onSave: (categoria: Omit<Categoria, 'id'> | Categoria) => Promise<void>;
  isPadrao: (id: string) => boolean;
}

const CORES = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];

export function CategoriaForm({ categoria, onClose, onSave, isPadrao }: CategoriaFormProps) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('despesa');
  const [cor, setCor] = useState(CORES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!categoria;
  const padrao = isEditMode && isPadrao(categoria.id);

  useEffect(() => {
    if (categoria) {
      setNome(categoria.nome);
      setTipo(categoria.tipo);
      setCor(categoria.cor ?? CORES[0]);
    }
  }, [categoria]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const nomeTrim = nome.trim();
    if (!nomeTrim) {
      setError('Nome é obrigatório');
      return;
    }

    setLoading(true);
    try {
      if (categoria) {
        await onSave({ ...categoria, nome: nomeTrim, tipo: padrao ? categoria.tipo : tipo, cor });
      } else {
        await onSave({ nome: nomeTrim, tipo, cor });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-md bg-black/50">
      <div className="bg-surface rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between px-lg py-md border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">
            {isEditMode ? 'Editar categoria' : 'Nova categoria'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-sm rounded-md hover:bg-background text-text-secondary"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-lg flex flex-col gap-md">
          {error && (
            <div className="p-md bg-negative/10 border border-negative rounded-md text-negative text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-xs">Nome *</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Alimentação"
              className="w-full p-md border border-border rounded-md text-text-primary bg-background focus:outline-none focus:border-positive"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-xs">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as 'receita' | 'despesa')}
              disabled={padrao}
              className="w-full p-md border border-border rounded-md text-text-primary bg-background focus:outline-none focus:border-positive disabled:opacity-60"
            >
              <option value="despesa">Despesa</option>
              <option value="receita">Receita</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-xs">Cor</label>
            <div className="flex gap-sm flex-wrap">
              {CORES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    cor === c ? 'border-positive scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Cor ${c}`}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-md pt-sm">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-sm px-md border border-border rounded-md text-text-primary hover:bg-background"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-sm px-md bg-positive text-white rounded-md font-medium hover:bg-positive/90 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
