import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { Lancamento } from '@/types';
import { useContas } from '@/hooks/useContas';
import { useCategorias } from '@/hooks/useCategorias';
import { useCartoes } from '@/hooks/useCartoes';
import { formatNumberInput, parseNumberInput, handleNumberInputChange } from '@/utils/numberMask';
import { CartaoForm } from '@/modules/Configuracoes/Cartoes/CartaoForm';
import { ContaForm } from '@/modules/Configuracoes/Contas/ContaForm';

function getDataInicialParaMes(mes: string): string {
  const [year, month] = mes.split('-').map(Number);
  const hoje = new Date();
  const mesAtual = hoje.getFullYear() * 12 + hoje.getMonth();
  const mesAlvo = year * 12 + (month - 1);
  if (mesAtual === mesAlvo) return hoje.toISOString().split('T')[0];
  const ultimoDia = new Date(year, month, 0);
  return ultimoDia.toISOString().split('T')[0];
}

interface LancamentoFormProps {
  lancamento?: Lancamento | null;
  tipoPreSelecionado?: 'receita' | 'despesa';
  mesPreSelecionado?: string;
  onClose: () => void;
  onSave: (lancamento: Omit<Lancamento, 'id'> | Lancamento) => Promise<void>;
}

export function LancamentoForm({
  lancamento,
  tipoPreSelecionado,
  mesPreSelecionado,
  onClose,
  onSave,
}: LancamentoFormProps) {
  const { contas, addConta } = useContas();
  const { categorias } = useCategorias();
  const { cartoes, addCartao } = useCartoes();

  const [showCartaoForm, setShowCartaoForm] = useState(false);
  const [showContaForm, setShowContaForm] = useState(false);
  const cartoesCountBeforeRef = useRef(0);
  const contasCountBeforeRef = useRef(0);
  const [tipo, setTipo] = useState<'receita' | 'despesa'>(
    tipoPreSelecionado || lancamento?.tipo || 'despesa'
  );
  const [valor, setValor] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState<'debito' | 'cartao'>('debito');
  const [contaId, setContaId] = useState('');
  const [cartaoId, setCartaoId] = useState('');
  const [parcelado, setParcelado] = useState(false);
  const [numeroParcelas, setNumeroParcelas] = useState('1');
  const [data, setData] = useState(
    mesPreSelecionado ? getDataInicialParaMes(mesPreSelecionado) : new Date().toISOString().split('T')[0]
  );
  const [descricao, setDescricao] = useState('');
  const [pago, setPago] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isEditMode = !!lancamento;

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const getInputClassName = (hasError: boolean) =>
    `p-md border rounded-md text-base font-inherit text-text-primary bg-surface transition-colors duration-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
      hasError
        ? 'border-negative focus:border-negative focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]'
        : 'border-border focus:border-positive focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)]'
    }`;

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
      setMetodoPagamento(lancamento.cartaoId ? 'cartao' : 'debito');
      setParcelado(lancamento.parcelado || false);
      setNumeroParcelas(formatNumberInput(lancamento.totalParcelas || 1, false));
      setData(new Date(lancamento.data).toISOString().split('T')[0]);
      setDescricao(lancamento.descricao);
      setPago(lancamento.pago !== undefined ? lancamento.pago : true);
    } else {
      // Valores padrão para novo lançamento
      setPago(tipo === 'receita');
      setMetodoPagamento('debito');
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
    setFieldErrors({});

    const errors: Record<string, string> = {};

    // Validações
    const valorNum = parseNumberInput(valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      errors.valor = valor.trim() ? 'Valor deve ser maior que zero' : 'Este campo é obrigatório';
    }

    if (!categoriaId) {
      errors.categoriaId = 'Este campo é obrigatório';
    }

    if (tipo === 'despesa') {
      if (metodoPagamento === 'debito' && !contaId) {
        errors.contaId = 'Este campo é obrigatório';
      }
      if (metodoPagamento === 'cartao' && !cartaoId) {
        errors.cartaoId = 'Este campo é obrigatório';
      }
      if (metodoPagamento === 'cartao' && parcelado) {
        const parcelasNum = parseNumberInput(numeroParcelas);
        if (isNaN(parcelasNum) || parcelasNum < 1 || parcelasNum > 24) {
          errors.numeroParcelas = 'Número de parcelas deve ser entre 1 e 24';
        }
      }
    } else {
      if (!contaId) {
        errors.contaId = 'Este campo é obrigatório';
      }
    }

    if (!data) {
      errors.data = 'Este campo é obrigatório';
    } else {
      const dataObj = new Date(data);
      if (isNaN(dataObj.getTime())) {
        errors.data = 'Data inválida';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const dataObj = new Date(data);

    try {
      setLoading(true);

      const lancamentoData: Omit<Lancamento, 'id'> | Lancamento = isEditMode && lancamento
        ? {
            ...lancamento,
            tipo,
            valor: valorNum,
            categoriaId,
            contaId: metodoPagamento === 'debito' ? (contaId || undefined) : undefined,
            cartaoId: metodoPagamento === 'cartao' ? (cartaoId || undefined) : undefined,
            data: dataObj,
            descricao: descricao.trim(),
            pago: tipo === 'receita' ? true : pago,
            parcelado: metodoPagamento === 'cartao' && parcelado,
            totalParcelas: metodoPagamento === 'cartao' && parcelado ? parseNumberInput(numeroParcelas) : undefined,
            parcelaAtual: lancamento.parcelaAtual,
            lancamentoPaiId: lancamento.lancamentoPaiId,
          }
        : {
            tipo,
            valor: valorNum,
            categoriaId,
            contaId: metodoPagamento === 'debito' ? (contaId || undefined) : undefined,
            cartaoId: metodoPagamento === 'cartao' ? (cartaoId || undefined) : undefined,
            data: dataObj,
            descricao: descricao.trim(),
            pago: tipo === 'receita' ? true : pago,
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

  const handleOpenCartaoForm = () => {
    cartoesCountBeforeRef.current = cartoesAtivos.length;
    setShowCartaoForm(true);
  };
  const handleOpenContaForm = () => {
    contasCountBeforeRef.current = contasAtivas.length;
    setShowContaForm(true);
  };

  const handleCloseCartaoForm = () => setShowCartaoForm(false);
  const handleCloseContaForm = () => setShowContaForm(false);

  const handleSaveCartao = async (cartaoData: Parameters<typeof addCartao>[0]) => {
    await addCartao(cartaoData);
    handleCloseCartaoForm();
  };

  const handleSaveConta = async (contaData: Parameters<typeof addConta>[0]) => {
    await addConta(contaData);
    handleCloseContaForm();
  };

  useEffect(() => {
    if (!showCartaoForm && cartoesAtivos.length > cartoesCountBeforeRef.current && metodoPagamento === 'cartao') {
      const lastCartao = cartoesAtivos[cartoesAtivos.length - 1];
      setCartaoId(lastCartao.id);
    }
  }, [showCartaoForm, cartoesAtivos, metodoPagamento]);

  useEffect(() => {
    if (!showContaForm && contasAtivas.length > contasCountBeforeRef.current) {
      const lastConta = contasAtivas[contasAtivas.length - 1];
      setContaId(lastConta.id);
    }
  }, [showContaForm, contasAtivas]);

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-[1000] p-md animate-[fadeIn_0.2s_ease]"
      onClick={handleClose}
    >
      <div
        className="rounded-lg overflow-hidden w-full max-w-[500px] max-h-[90vh] shadow-lg bg-surface animate-[slideUp_0.3s_ease] md:max-w-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-y-auto max-h-[90vh]">
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

        <form onSubmit={handleSubmit} className="p-lg flex flex-col gap-md" noValidate>
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
              className={getInputClassName(!!fieldErrors.valor)}
              value={valor}
              onChange={(e) => {
                clearFieldError('valor');
                setValor(handleNumberInputChange(e, true));
              }}
              placeholder="0,00"
              disabled={loading}
            />
            {fieldErrors.valor && (
              <p className="text-sm text-negative" role="alert">
                {fieldErrors.valor}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-xs">
            <label htmlFor="categoria" className="text-sm font-medium text-text-primary">
              Categoria *
            </label>
            <select
              id="categoria"
              className={getInputClassName(!!fieldErrors.categoriaId)}
              value={categoriaId}
              onChange={(e) => {
                clearFieldError('categoriaId');
                setCategoriaId(e.target.value);
              }}
              disabled={loading || categoriasFiltradas.length === 0}
            >
              <option value="">Selecione uma categoria</option>
              {categoriasFiltradas.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>
            {fieldErrors.categoriaId && (
              <p className="text-sm text-negative" role="alert">
                {fieldErrors.categoriaId}
              </p>
            )}
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
                      value="debito"
                      checked={metodoPagamento === 'debito'}
                      onChange={() => {
                        setMetodoPagamento('debito');
                        setCartaoId('');
                        setParcelado(false);
                      }}
                      disabled={loading}
                      className="cursor-pointer"
                    />
                    <span className="text-text-primary">Débito</span>
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

              {metodoPagamento === 'debito' && (
                <div className="flex flex-col gap-xs">
                  <label htmlFor="conta" className="text-sm font-medium text-text-primary">
                    Conta *
                  </label>
                  <select
                    id="conta"
                    className={getInputClassName(!!fieldErrors.contaId)}
                    value={contaId}
                    onChange={(e) => {
                      clearFieldError('contaId');
                      setContaId(e.target.value);
                    }}
                    disabled={loading || contasAtivas.length === 0}
                  >
                    <option value="">Selecione uma conta</option>
                    {contasAtivas.map((conta) => (
                      <option key={conta.id} value={conta.id}>
                        {conta.nome} ({conta.tipo === 'corrente' ? 'Corrente' : conta.tipo === 'poupanca' ? 'Poupança' : 'Investimento'})
                      </option>
                    ))}
                  </select>
                  {fieldErrors.contaId && (
                    <p className="text-sm text-negative" role="alert">
                      {fieldErrors.contaId}
                    </p>
                  )}
                  {contasAtivas.length === 0 && (
                    <p className="text-sm text-text-muted">
                      Nenhuma conta cadastrada.{' '}
                      <button
                        type="button"
                        className="text-positive underline hover:text-[#16a34a] transition-colors duration-200 cursor-pointer bg-transparent border-none p-0 font-inherit text-inherit"
                        onClick={handleOpenContaForm}
                        disabled={loading}
                      >
                        Adicionar conta
                      </button>
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
                      className={getInputClassName(!!fieldErrors.cartaoId)}
                      value={cartaoId}
                      onChange={(e) => {
                        clearFieldError('cartaoId');
                        setCartaoId(e.target.value);
                      }}
                      disabled={loading || cartoesAtivos.length === 0}
                    >
                      <option value="">Selecione um cartão</option>
                      {cartoesAtivos.map((cartao) => (
                        <option key={cartao.id} value={cartao.id}>
                          {cartao.nome} (Limite: R$ {cartao.limite.toFixed(2)})
                        </option>
                      ))}
                    </select>
                    {fieldErrors.cartaoId && (
                      <p className="text-sm text-negative" role="alert">
                        {fieldErrors.cartaoId}
                      </p>
                    )}
                    {cartoesAtivos.length === 0 && (
                      <p className="text-sm text-text-muted">
                        Nenhum cartão cadastrado.{' '}
                        <button
                          type="button"
                          className="text-positive underline hover:text-[#16a34a] transition-colors duration-200 cursor-pointer bg-transparent border-none p-0 font-inherit text-inherit"
                          onClick={handleOpenCartaoForm}
                          disabled={loading}
                        >
                          Adicionar cartão
                        </button>
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
                        className={getInputClassName(!!fieldErrors.numeroParcelas)}
                        value={numeroParcelas}
                        onChange={(e) => {
                          clearFieldError('numeroParcelas');
                          setNumeroParcelas(handleNumberInputChange(e, false));
                        }}
                        placeholder="1"
                        disabled={loading}
                      />
                      {fieldErrors.numeroParcelas && (
                        <p className="text-sm text-negative" role="alert">
                          {fieldErrors.numeroParcelas}
                        </p>
                      )}
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
              <label htmlFor="conta-receita" className="text-sm font-medium text-text-primary">
                Conta *
              </label>
              <select
                id="conta-receita"
                className={getInputClassName(!!fieldErrors.contaId)}
                value={contaId}
                onChange={(e) => {
                  clearFieldError('contaId');
                  setContaId(e.target.value);
                }}
                disabled={loading || contasAtivas.length === 0}
              >
                <option value="">Selecione uma conta</option>
                {contasAtivas.map((conta) => (
                  <option key={conta.id} value={conta.id}>
                    {conta.nome} ({conta.tipo === 'corrente' ? 'Corrente' : conta.tipo === 'poupanca' ? 'Poupança' : 'Investimento'})
                  </option>
                ))}
              </select>
              {fieldErrors.contaId && (
                <p className="text-sm text-negative" role="alert">
                  {fieldErrors.contaId}
                </p>
              )}
              {contasAtivas.length === 0 && (
                <p className="text-sm text-text-muted">
                  Nenhuma conta cadastrada.{' '}
                  <button
                    type="button"
                    className="text-positive underline hover:text-[#16a34a] transition-colors duration-200 cursor-pointer bg-transparent border-none p-0 font-inherit text-inherit"
                    onClick={handleOpenContaForm}
                    disabled={loading}
                  >
                    Adicionar conta
                  </button>
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
              className={getInputClassName(!!fieldErrors.data)}
              value={data}
              onChange={(e) => {
                clearFieldError('data');
                setData(e.target.value);
              }}
              disabled={loading}
              max={new Date().toISOString().split('T')[0]}
            />
            {fieldErrors.data && (
              <p className="text-sm text-negative" role="alert">
                {fieldErrors.data}
              </p>
            )}
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

          {tipo === 'despesa' && (
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
          )}

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
      </div>

      {showCartaoForm && (
        <div className="fixed inset-0 z-[1100]">
          <CartaoForm
            onClose={handleCloseCartaoForm}
            onSave={handleSaveCartao}
          />
        </div>
      )}

      {showContaForm && (
        <div className="fixed inset-0 z-[1100]">
          <ContaForm
            onClose={handleCloseContaForm}
            onSave={handleSaveConta}
          />
        </div>
      )}

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
