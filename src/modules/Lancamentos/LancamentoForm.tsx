import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Lancamento } from '@/types';
import { useContas } from '@/hooks/useContas';
import { useCategorias } from '@/hooks/useCategorias';
import { useCartoes } from '@/hooks/useCartoes';
import { formatNumberInput, parseNumberInput, handleNumberInputChange } from '@/utils/numberMask';

interface LancamentoFormProps {
  lancamento?: Lancamento | null;
  tipoPreSelecionado?: 'receita' | 'despesa';
  onClose: () => void;
  onSave: (lancamento: Omit<Lancamento, 'id'> | Lancamento) => Promise<void>;
}

export function LancamentoForm({
  lancamento,
  tipoPreSelecionado,
  onClose,
  onSave,
}: LancamentoFormProps) {
  const { contas } = useContas();
  const { categorias } = useCategorias();
  const { cartoes } = useCartoes();

  const [tipo, setTipo] = useState<'receita' | 'despesa'>(
    tipoPreSelecionado || lancamento?.tipo || 'despesa'
  );
  const [valor, setValor] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState<'conta' | 'cartao'>('conta');
  const [contaId, setContaId] = useState('');
  const [cartaoId, setCartaoId] = useState('');
  const [parcelado, setParcelado] = useState(false);
  const [numeroParcelas, setNumeroParcelas] = useState('1');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [descricao, setDescricao] = useState('');
  const [pago, setPago] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!lancamento;

  // Filtrar categorias por tipo
  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipo);

  // Filtrar contas ativas
  const contasAtivas = contas.filter((c) => c.ativa);

  // Filtrar cartões ativos
  const cartoesAtivos = cartoes.filter((c) => c.ativo);

  useEffect(() => {
    if (lancamento) {
      setTipo(lancamento.tipo);
      setValor(formatNumberInput(lancamento.valor));
      setCategoriaId(lancamento.categoriaId);
      setContaId(lancamento.contaId || '');
      setCartaoId(lancamento.cartaoId || '');
      setMetodoPagamento(lancamento.cartaoId ? 'cartao' : 'conta');
      setParcelado(lancamento.parcelado || false);
      setNumeroParcelas(formatNumberInput(lancamento.totalParcelas || 1, false));
      setData(new Date(lancamento.data).toISOString().split('T')[0]);
      setDescricao(lancamento.descricao);
      setPago(lancamento.pago !== undefined ? lancamento.pago : true);
    } else {
      // Valores padrão para novo lançamento
      setPago(tipo === 'receita');
      setMetodoPagamento('conta');
      setParcelado(false);
      setNumeroParcelas('1');
    }
  }, [lancamento, tipo]);

  // Resetar categoria quando tipo mudar
  useEffect(() => {
    if (!isEditMode) {
      setCategoriaId('');
    }
  }, [tipo, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações
    const valorNum = parseNumberInput(valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      setError('Valor deve ser maior que zero');
      return;
    }

    if (!categoriaId) {
      setError('Categoria é obrigatória');
      return;
    }

    if (tipo === 'despesa') {
      if (metodoPagamento === 'conta' && !contaId) {
        setError('Conta deve ser informada');
        return;
      }
      if (metodoPagamento === 'cartao' && !cartaoId) {
        setError('Cartão deve ser informado');
        return;
      }
      if (metodoPagamento === 'cartao' && parcelado) {
        const parcelasNum = parseNumberInput(numeroParcelas);
        if (isNaN(parcelasNum) || parcelasNum < 1 || parcelasNum > 24) {
          setError('Número de parcelas deve ser entre 1 e 24');
          return;
        }
      }
    } else {
      // Receita sempre usa conta
      if (!contaId) {
        setError('Conta deve ser informada');
        return;
      }
    }

    if (!data) {
      setError('Data é obrigatória');
      return;
    }

    const dataObj = new Date(data);
    if (isNaN(dataObj.getTime())) {
      setError('Data inválida');
      return;
    }

    try {
      setLoading(true);

      const lancamentoData: Omit<Lancamento, 'id'> | Lancamento = isEditMode && lancamento
        ? {
            ...lancamento,
            tipo,
            valor: valorNum,
            categoriaId,
            contaId: metodoPagamento === 'conta' ? (contaId || undefined) : undefined,
            cartaoId: metodoPagamento === 'cartao' ? (cartaoId || undefined) : undefined,
            data: dataObj,
            descricao: descricao.trim(),
            pago,
            parcelado: metodoPagamento === 'cartao' && parcelado,
            totalParcelas: metodoPagamento === 'cartao' && parcelado ? parseNumberInput(numeroParcelas) : undefined,
            parcelaAtual: lancamento.parcelaAtual,
            lancamentoPaiId: lancamento.lancamentoPaiId,
          }
        : {
            tipo,
            valor: valorNum,
            categoriaId,
            contaId: metodoPagamento === 'conta' ? (contaId || undefined) : undefined,
            cartaoId: metodoPagamento === 'cartao' ? (cartaoId || undefined) : undefined,
            data: dataObj,
            descricao: descricao.trim(),
            pago,
            parcelado: metodoPagamento === 'cartao' && parcelado,
            totalParcelas: metodoPagamento === 'cartao' && parcelado ? parseNumberInput(numeroParcelas) : undefined,
            casalId: 'casal-1',
          };

      await onSave(lancamentoData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar lançamento');
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
            {isEditMode ? 'Editar Lançamento' : tipo === 'despesa' ? 'Nova Despesa' : 'Nova Receita'}
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

          {!tipoPreSelecionado && (
            <div className="flex flex-col gap-xs">
              <label className="text-sm font-medium text-text-primary">Tipo *</label>
              <div className="flex gap-md">
                <label className="flex items-center gap-sm cursor-pointer flex-1 p-md border border-border rounded-md hover:bg-background transition-colors">
                  <input
                    type="radio"
                    name="tipo"
                    value="despesa"
                    checked={tipo === 'despesa'}
                    onChange={(e) => setTipo(e.target.value as 'despesa')}
                    disabled={loading}
                    className="cursor-pointer"
                  />
                  <span className="text-text-primary">Despesa</span>
                </label>
                <label className="flex items-center gap-sm cursor-pointer flex-1 p-md border border-border rounded-md hover:bg-background transition-colors">
                  <input
                    type="radio"
                    name="tipo"
                    value="receita"
                    checked={tipo === 'receita'}
                    onChange={(e) => setTipo(e.target.value as 'receita')}
                    disabled={loading}
                    className="cursor-pointer"
                  />
                  <span className="text-text-primary">Receita</span>
                </label>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-xs">
            <label htmlFor="valor" className="text-sm font-medium text-text-primary">
              Valor *
            </label>
            <input
              id="valor"
              type="text"
              inputMode="decimal"
              className="p-md border border-border rounded-md text-base font-inherit text-text-primary bg-surface transition-colors duration-200 focus:outline-none focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] disabled:opacity-60 disabled:cursor-not-allowed"
              value={valor}
              onChange={(e) => setValor(handleNumberInputChange(e, true))}
              placeholder="0,00"
              required
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label htmlFor="categoria" className="text-sm font-medium text-text-primary">
              Categoria *
            </label>
            <select
              id="categoria"
              className="p-md border border-border rounded-md text-base font-inherit text-text-primary bg-surface transition-colors duration-200 focus:outline-none focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] disabled:opacity-60 disabled:cursor-not-allowed"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              required
              disabled={loading || categoriasFiltradas.length === 0}
            >
              <option value="">Selecione uma categoria</option>
              {categoriasFiltradas.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>
            {categoriasFiltradas.length === 0 && (
              <p className="text-sm text-text-muted">
                Nenhuma categoria de {tipo} cadastrada. Cadastre uma categoria primeiro.
              </p>
            )}
          </div>

          {tipo === 'despesa' && (
            <>
              <div className="flex flex-col gap-xs">
                <label className="text-sm font-medium text-text-primary">Método de Pagamento *</label>
                <div className="flex gap-md">
                  <label className="flex items-center gap-sm cursor-pointer flex-1 p-md border border-border rounded-md hover:bg-background transition-colors">
                    <input
                      type="radio"
                      name="metodoPagamento"
                      value="conta"
                      checked={metodoPagamento === 'conta'}
                      onChange={() => {
                        setMetodoPagamento('conta');
                        setCartaoId('');
                        setParcelado(false);
                      }}
                      disabled={loading}
                      className="cursor-pointer"
                    />
                    <span className="text-text-primary">Conta</span>
                  </label>
                  <label className="flex items-center gap-sm cursor-pointer flex-1 p-md border border-border rounded-md hover:bg-background transition-colors">
                    <input
                      type="radio"
                      name="metodoPagamento"
                      value="cartao"
                      checked={metodoPagamento === 'cartao'}
                      onChange={() => {
                        setMetodoPagamento('cartao');
                        setContaId('');
                      }}
                      disabled={loading}
                      className="cursor-pointer"
                    />
                    <span className="text-text-primary">Cartão de Crédito</span>
                  </label>
                </div>
              </div>

              {metodoPagamento === 'conta' && (
                <div className="flex flex-col gap-xs">
                  <label htmlFor="conta" className="text-sm font-medium text-text-primary">
                    Conta *
                  </label>
                  <select
                    id="conta"
                    className="p-md border border-border rounded-md text-base font-inherit text-text-primary bg-surface transition-colors duration-200 focus:outline-none focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] disabled:opacity-60 disabled:cursor-not-allowed"
                    value={contaId}
                    onChange={(e) => setContaId(e.target.value)}
                    disabled={loading || contasAtivas.length === 0}
                  >
                    <option value="">Selecione uma conta</option>
                    {contasAtivas.map((conta) => (
                      <option key={conta.id} value={conta.id}>
                        {conta.nome} ({conta.tipo === 'corrente' ? 'Corrente' : conta.tipo === 'poupanca' ? 'Poupança' : 'Investimento'})
                      </option>
                    ))}
                  </select>
                  {contasAtivas.length === 0 && (
                    <p className="text-sm text-text-muted">
                      Nenhuma conta cadastrada. Cadastre uma conta primeiro.
                    </p>
                  )}
                </div>
              )}

              {metodoPagamento === 'cartao' && (
                <>
                  <div className="flex flex-col gap-xs">
                    <label htmlFor="cartao" className="text-sm font-medium text-text-primary">
                      Cartão de Crédito *
                    </label>
                    <select
                      id="cartao"
                      className="p-md border border-border rounded-md text-base font-inherit text-text-primary bg-surface transition-colors duration-200 focus:outline-none focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] disabled:opacity-60 disabled:cursor-not-allowed"
                      value={cartaoId}
                      onChange={(e) => setCartaoId(e.target.value)}
                      disabled={loading || cartoesAtivos.length === 0}
                    >
                      <option value="">Selecione um cartão</option>
                      {cartoesAtivos.map((cartao) => (
                        <option key={cartao.id} value={cartao.id}>
                          {cartao.nome} (Limite: R$ {cartao.limite.toFixed(2)})
                        </option>
                      ))}
                    </select>
                    {cartoesAtivos.length === 0 && (
                      <p className="text-sm text-text-muted">
                        Nenhum cartão cadastrado. Cadastre um cartão primeiro.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-xs">
                    <label className="text-sm font-medium text-text-primary">Forma de Pagamento</label>
                    <div className="flex gap-md">
                      <label className="flex items-center gap-sm cursor-pointer flex-1 p-md border border-border rounded-md hover:bg-background transition-colors">
                        <input
                          type="radio"
                          name="parcelado"
                          checked={!parcelado}
                          onChange={() => setParcelado(false)}
                          disabled={loading || !cartaoId}
                          className="cursor-pointer"
                        />
                        <span className="text-text-primary">À vista</span>
                      </label>
                      <label className="flex items-center gap-sm cursor-pointer flex-1 p-md border border-border rounded-md hover:bg-background transition-colors">
                        <input
                          type="radio"
                          name="parcelado"
                          checked={parcelado}
                          onChange={() => setParcelado(true)}
                          disabled={loading || !cartaoId}
                          className="cursor-pointer"
                        />
                        <span className="text-text-primary">Parcelado</span>
                      </label>
                    </div>
                  </div>

                  {parcelado && cartaoId && (
                    <div className="flex flex-col gap-xs">
                      <label htmlFor="numeroParcelas" className="text-sm font-medium text-text-primary">
                        Número de Parcelas *
                      </label>
                      <input
                        id="numeroParcelas"
                        type="text"
                        inputMode="numeric"
                        className="p-md border border-border rounded-md text-base font-inherit text-text-primary bg-surface transition-colors duration-200 focus:outline-none focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] disabled:opacity-60 disabled:cursor-not-allowed"
                        value={numeroParcelas}
                        onChange={(e) => setNumeroParcelas(handleNumberInputChange(e, false))}
                        placeholder="1"
                        required
                        disabled={loading}
                      />
                      <p className="text-sm text-text-muted">
                        Valor por parcela: R$ {valor && numeroParcelas ? formatNumberInput(parseNumberInput(valor) / parseNumberInput(numeroParcelas)) : '0,00'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {tipo === 'receita' && (
            <div className="flex flex-col gap-xs">
              <label htmlFor="conta" className="text-sm font-medium text-text-primary">
                Conta *
              </label>
              <select
                id="conta"
                className="p-md border border-border rounded-md text-base font-inherit text-text-primary bg-surface transition-colors duration-200 focus:outline-none focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] disabled:opacity-60 disabled:cursor-not-allowed"
                value={contaId}
                onChange={(e) => setContaId(e.target.value)}
                disabled={loading || contasAtivas.length === 0}
              >
                <option value="">Selecione uma conta</option>
                {contasAtivas.map((conta) => (
                  <option key={conta.id} value={conta.id}>
                    {conta.nome} ({conta.tipo === 'corrente' ? 'Corrente' : conta.tipo === 'poupanca' ? 'Poupança' : 'Investimento'})
                  </option>
                ))}
              </select>
              {contasAtivas.length === 0 && (
                <p className="text-sm text-text-muted">
                  Nenhuma conta cadastrada. Cadastre uma conta primeiro.
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-xs">
            <label htmlFor="data" className="text-sm font-medium text-text-primary">
              Data *
            </label>
            <input
              id="data"
              type="date"
              className="p-md border border-border rounded-md text-base font-inherit text-text-primary bg-surface transition-colors duration-200 focus:outline-none focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] disabled:opacity-60 disabled:cursor-not-allowed"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
              disabled={loading}
              max={new Date().toISOString().split('T')[0]} // Não permitir datas futuras
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label htmlFor="descricao" className="text-sm font-medium text-text-primary">
              Descrição
            </label>
            <textarea
              id="descricao"
              className="p-md border border-border rounded-md text-base font-inherit text-text-primary bg-surface transition-colors duration-200 focus:outline-none focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] disabled:opacity-60 disabled:cursor-not-allowed resize-none"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição opcional do lançamento"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label className="flex items-center gap-sm cursor-pointer text-sm text-text-primary">
              <input
                type="checkbox"
                className="w-[18px] h-[18px] cursor-pointer"
                checked={pago}
                onChange={(e) => setPago(e.target.checked)}
                disabled={loading}
              />
              <span>Marcar como pago</span>
            </label>
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
              {loading ? 'Salvando...' : isEditMode ? 'Salvar' : 'Criar Lançamento'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
