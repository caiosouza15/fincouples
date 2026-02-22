import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { useCasal } from '@/hooks/useCasal';

export function CasalConfig() {
  const { usuario1Nome, usuario2Nome, setUsuario1Nome, setUsuario2Nome } = useCasal();
  const [nome1, setNome1] = useState(usuario1Nome);
  const [nome2, setNome2] = useState(usuario2Nome);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setNome1(usuario1Nome);
    setNome2(usuario2Nome);
  }, [usuario1Nome, usuario2Nome]);

  const validateNome = (nome: string): string | null => {
    const trimmed = nome.trim();
    if (trimmed.length < 2) {
      return 'Nome deve ter pelo menos 2 caracteres';
    }
    if (trimmed.length > 50) {
      return 'Nome deve ter no máximo 50 caracteres';
    }
    return null;
  };

  const handleSave = () => {
    const error1 = validateNome(nome1);
    const error2 = validateNome(nome2);

    if (error1 || error2) {
      setErrors({
        nome1: error1 || '',
        nome2: error2 || '',
      });
      return;
    }

    try {
      setUsuario1Nome(nome1.trim());
      setUsuario2Nome(nome2.trim());
      setErrors({});
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setErrors({
        geral: err instanceof Error ? err.message : 'Erro ao salvar configuração',
      });
    }
  };

  const getInputClassName = (hasError: boolean) =>
    `p-md border rounded-md text-base font-inherit text-text-primary bg-surface transition-colors duration-200 focus:outline-none ${
      hasError
        ? 'border-negative focus:border-negative focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]'
        : 'border-border focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)]'
    }`;

  return (
    <Card title="Configuração do Casal">
      <div className="flex flex-col gap-lg">
        <div className="p-md bg-background rounded-md border border-border">
          <p className="text-sm text-text-secondary mb-md">
            Configure os nomes das pessoas do casal. Estes nomes serão usados em formulários e relatórios para identificar quem realizou cada gasto ou é proprietário de cada cartão.
          </p>
        </div>

        <div className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <label htmlFor="nome1" className="text-sm font-medium text-text-primary">
              Nome da Pessoa 1 *
            </label>
            <input
              id="nome1"
              type="text"
              className={getInputClassName(!!errors.nome1)}
              value={nome1}
              onChange={(e) => {
                setNome1(e.target.value);
                if (errors.nome1) {
                  setErrors((prev) => ({ ...prev, nome1: '' }));
                }
              }}
              placeholder="Ex: João"
              maxLength={50}
            />
            {errors.nome1 && (
              <p className="text-sm text-negative" role="alert">
                {errors.nome1}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-xs">
            <label htmlFor="nome2" className="text-sm font-medium text-text-primary">
              Nome da Pessoa 2 *
            </label>
            <input
              id="nome2"
              type="text"
              className={getInputClassName(!!errors.nome2)}
              value={nome2}
              onChange={(e) => {
                setNome2(e.target.value);
                if (errors.nome2) {
                  setErrors((prev) => ({ ...prev, nome2: '' }));
                }
              }}
              placeholder="Ex: Maria"
              maxLength={50}
            />
            {errors.nome2 && (
              <p className="text-sm text-negative" role="alert">
                {errors.nome2}
              </p>
            )}
          </div>
        </div>

        {errors.geral && (
          <div className="p-md bg-negative/10 border border-negative rounded-md text-negative text-sm" role="alert">
            {errors.geral}
          </div>
        )}

        {saved && (
          <div className="p-md bg-positive/10 border border-positive rounded-md text-positive text-sm" role="alert">
            Configuração salva com sucesso!
          </div>
        )}

        <div className="flex gap-md">
          <button
            onClick={handleSave}
            className="bg-positive text-white py-sm px-lg rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-positive/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Salvar
          </button>
        </div>

        <div className="p-md bg-background rounded-md border border-border">
          <h3 className="text-sm font-medium text-text-primary mb-sm">Preview</h3>
          <p className="text-sm text-text-secondary">
            Nos formulários, você verá:
          </p>
          <div className="mt-sm flex gap-md">
            <div className="p-sm bg-surface rounded border border-border">
              <span className="text-xs text-text-secondary">Proprietário:</span>
              <div className="flex gap-sm mt-xs">
                <label className="flex items-center gap-xs text-sm text-text-primary">
                  <input type="radio" checked={true} readOnly className="w-3 h-3" />
                  <span>{nome1.trim() || 'Pessoa 1'}</span>
                </label>
                <label className="flex items-center gap-xs text-sm text-text-primary">
                  <input type="radio" checked={false} readOnly className="w-3 h-3" />
                  <span>{nome2.trim() || 'Pessoa 2'}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
