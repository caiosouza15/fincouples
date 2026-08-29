import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { Lancamento } from '@/types';
import { useContas } from '@/hooks/useContas';
import { useCategorias } from '@/hooks/useCategorias';
import { useCartoes } from '@/hooks/useCartoes';
import { useCasal } from '@/hooks/useCasal';
import { formatNumberInput, parseNumberInput, handleNumberInputChange } from '@/utils/numberMask';
import { CartaoForm } from '@/modules/Configuracoes/Cartoes/CartaoForm';
import { ContaForm } from '@/modules/Configuracoes/Contas/ContaForm';
import styles from './LancamentoForm.module.css';

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
  const { usuario1Nome, usuario2Nome, getNomePessoa } = useCasal();

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
  const [pessoaId, setPessoaId] = useState<'usuario1' | 'usuario2'>('usuario1');
  const [pago, setPago] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const valorInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!(lancamento?.id);

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const inputClassName = (hasError: boolean) => `${styles.input} ${hasError ? styles.inputError : ''}`;

  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipo);
  const contasAtivas = contas.filter((c) => c.ativa);
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
      setPessoaId(lancamento.pessoaId || 'usuario1');
      setPago(lancamento.pago !== undefined ? lancamento.pago : true);
    } else {
      setPago(tipo === 'receita');
      setMetodoPagamento('debito');
      setParcelado(false);
      setNumeroParcelas('1');
      setPessoaId('usuario1');
    }
  }, [lancamento, tipo]);

  useEffect(() => {
    if (metodoPagamento === 'cartao' && cartaoId && !isEditMode) {
      const cartaoSelecionado = cartoes.find((c) => c.id === cartaoId);
      if (cartaoSelecionado?.proprietarioId) {
        setPessoaId(cartaoSelecionado.proprietarioId);
      }
    }
  }, [cartaoId, metodoPagamento, cartoes, isEditMode]);

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

      const nomePessoa = tipo === 'despesa' ? getNomePessoa(pessoaId) : undefined;

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
            pessoaId: tipo === 'despesa' ? pessoaId : undefined,
            nomePessoa: tipo === 'despesa' ? nomePessoa : undefined,
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
            pessoaId: tipo === 'despesa' ? pessoaId : undefined,
            nomePessoa: tipo === 'despesa' ? nomePessoa : undefined,
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
    if (!loading) onClose();
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

  useEffect(() => {
    if (valorInputRef.current) valorInputRef.current.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!loading) handleClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (formRef.current && !loading) formRef.current.requestSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading]);

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            {isEditMode ? 'Editar Lançamento' : tipo === 'despesa' ? 'Nova Despesa' : 'Nova Receita'}
          </h3>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Fechar" disabled={loading}>
            <X size={18} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className={styles.form} noValidate>
          {error && <div className={styles.errorBanner} role="alert">{error}</div>}

          {!tipoPreSelecionado && (
            <div className={styles.field}>
              <label className={styles.label}>Tipo *</label>
              <div className={styles.radioCardGroup}>
                <label className={`${styles.radioCard} ${tipo === 'despesa' ? styles.radioCardChecked : ''}`}>
                  <input
                    type="radio"
                    name="tipo"
                    value="despesa"
                    checked={tipo === 'despesa'}
                    onChange={(e) => setTipo(e.target.value as 'despesa')}
                    disabled={loading}
                  />
                  <span className={styles.radioCardLabel}>Despesa</span>
                </label>
                <label className={`${styles.radioCard} ${tipo === 'receita' ? styles.radioCardChecked : ''}`}>
                  <input
                    type="radio"
                    name="tipo"
                    value="receita"
                    checked={tipo === 'receita'}
                    onChange={(e) => setTipo(e.target.value as 'receita')}
                    disabled={loading}
                  />
                  <span className={styles.radioCardLabel}>Receita</span>
                </label>
              </div>
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="valor" className={styles.label}>Valor *</label>
            <input
              ref={valorInputRef}
              id="valor"
              type="text"
              inputMode="decimal"
              className={inputClassName(!!fieldErrors.valor)}
              value={valor}
              onChange={(e) => { clearFieldError('valor'); setValor(handleNumberInputChange(e, true)); }}
              placeholder="0,00"
              disabled={loading}
            />
            {fieldErrors.valor && <p className={styles.fieldError}>{fieldErrors.valor}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="categoria" className={styles.label}>Categoria *</label>
            <select
              id="categoria"
              className={styles.select}
              value={categoriaId}
              onChange={(e) => { clearFieldError('categoriaId'); setCategoriaId(e.target.value); }}
              disabled={loading || categoriasFiltradas.length === 0}
            >
              <option value="">Selecione uma categoria</option>
              {categoriasFiltradas.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
            {fieldErrors.categoriaId && <p className={styles.fieldError}>{fieldErrors.categoriaId}</p>}
            {categoriasFiltradas.length === 0 && (
              <p className={styles.hint}>Nenhuma categoria de {tipo} cadastrada. Cadastre uma categoria primeiro.</p>
            )}
          </div>

          {tipo === 'despesa' && (
            <div className={styles.field}>
              <label className={styles.label}>Quem realizou? *</label>
              <div className={styles.radioCardGroup}>
                <label className={`${styles.radioCard} ${pessoaId === 'usuario1' ? styles.radioCardChecked : ''}`}>
                  <input
                    type="radio"
                    name="pessoa"
                    checked={pessoaId === 'usuario1'}
                    onChange={() => { clearFieldError('pessoaId'); setPessoaId('usuario1'); }}
                    disabled={loading}
                  />
                  <span className={styles.radioCardLabel}>{usuario1Nome}</span>
                </label>
                <label className={`${styles.radioCard} ${pessoaId === 'usuario2' ? styles.radioCardChecked : ''}`}>
                  <input
                    type="radio"
                    name="pessoa"
                    checked={pessoaId === 'usuario2'}
                    onChange={() => { clearFieldError('pessoaId'); setPessoaId('usuario2'); }}
                    disabled={loading}
                  />
                  <span className={styles.radioCardLabel}>{usuario2Nome}</span>
                </label>
              </div>
            </div>
          )}

          {tipo === 'despesa' && (
            <>
              <div className={styles.field}>
                <label className={styles.label}>Método de Pagamento *</label>
                <div className={styles.radioCardGroup}>
                  <label className={`${styles.radioCard} ${metodoPagamento === 'debito' ? styles.radioCardChecked : ''}`}>
                    <input
                      type="radio"
                      name="metodoPagamento"
                      value="debito"
                      checked={metodoPagamento === 'debito'}
                      onChange={() => { setMetodoPagamento('debito'); setCartaoId(''); setParcelado(false); }}
                      disabled={loading}
                    />
                    <span className={styles.radioCardLabel}>Débito</span>
                  </label>
                  <label className={`${styles.radioCard} ${metodoPagamento === 'cartao' ? styles.radioCardChecked : ''}`}>
                    <input
                      type="radio"
                      name="metodoPagamento"
                      value="cartao"
                      checked={metodoPagamento === 'cartao'}
                      onChange={() => { setMetodoPagamento('cartao'); setContaId(''); }}
                      disabled={loading}
                    />
                    <span className={styles.radioCardLabel}>Cartão de Crédito</span>
                  </label>
                </div>
              </div>

              {metodoPagamento === 'debito' && (
                <div className={styles.field}>
                  <label htmlFor="conta" className={styles.label}>Conta *</label>
                  <select
                    id="conta"
                    className={styles.select}
                    value={contaId}
                    onChange={(e) => { clearFieldError('contaId'); setContaId(e.target.value); }}
                    disabled={loading || contasAtivas.length === 0}
                  >
                    <option value="">Selecione uma conta</option>
                    {contasAtivas.map((conta) => (
                      <option key={conta.id} value={conta.id}>
                        {conta.nome} ({conta.tipo === 'corrente' ? 'Corrente' : conta.tipo === 'poupanca' ? 'Poupança' : 'Investimento'})
                      </option>
                    ))}
                  </select>
                  {fieldErrors.contaId && <p className={styles.fieldError}>{fieldErrors.contaId}</p>}
                  {contasAtivas.length === 0 && (
                    <p className={styles.hint}>
                      Nenhuma conta cadastrada.{' '}
                      <button type="button" className={styles.hintLink} onClick={handleOpenContaForm} disabled={loading}>
                        Adicionar conta
                      </button>
                    </p>
                  )}
                </div>
              )}

              {metodoPagamento === 'cartao' && (
                <>
                  <div className={styles.field}>
                    <label htmlFor="cartao" className={styles.label}>Cartão de Crédito *</label>
                    <select
                      id="cartao"
                      className={styles.select}
                      value={cartaoId}
                      onChange={(e) => { clearFieldError('cartaoId'); setCartaoId(e.target.value); }}
                      disabled={loading || cartoesAtivos.length === 0}
                    >
                      <option value="">Selecione um cartão</option>
                      {cartoesAtivos.map((cartao) => (
                        <option key={cartao.id} value={cartao.id}>
                          {cartao.nome} (Limite: R$ {cartao.limite.toFixed(2)})
                        </option>
                      ))}
                    </select>
                    {fieldErrors.cartaoId && <p className={styles.fieldError}>{fieldErrors.cartaoId}</p>}
                    {cartoesAtivos.length === 0 && (
                      <p className={styles.hint}>
                        Nenhum cartão cadastrado.{' '}
                        <button type="button" className={styles.hintLink} onClick={handleOpenCartaoForm} disabled={loading}>
                          Adicionar cartão
                        </button>
                      </p>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Forma de Pagamento</label>
                    <div className={styles.radioCardGroup}>
                      <label className={`${styles.radioCard} ${!parcelado ? styles.radioCardChecked : ''}`}>
                        <input
                          type="radio"
                          name="parcelado"
                          checked={!parcelado}
                          onChange={() => setParcelado(false)}
                          disabled={loading || !cartaoId}
                        />
                        <span className={styles.radioCardLabel}>À vista</span>
                      </label>
                      <label className={`${styles.radioCard} ${parcelado ? styles.radioCardChecked : ''}`}>
                        <input
                          type="radio"
                          name="parcelado"
                          checked={parcelado}
                          onChange={() => setParcelado(true)}
                          disabled={loading || !cartaoId}
                        />
                        <span className={styles.radioCardLabel}>Parcelado</span>
                      </label>
                    </div>
                  </div>

                  {parcelado && cartaoId && (
                    <div className={styles.field}>
                      <label htmlFor="numeroParcelas" className={styles.label}>Número de Parcelas *</label>
                      <input
                        id="numeroParcelas"
                        type="text"
                        inputMode="numeric"
                        className={inputClassName(!!fieldErrors.numeroParcelas)}
                        value={numeroParcelas}
                        onChange={(e) => { clearFieldError('numeroParcelas'); setNumeroParcelas(handleNumberInputChange(e, false)); }}
                        placeholder="1"
                        disabled={loading}
                      />
                      {fieldErrors.numeroParcelas && <p className={styles.fieldError}>{fieldErrors.numeroParcelas}</p>}
                      <p className={styles.hint}>
                        Valor por parcela: R$ {valor && numeroParcelas ? formatNumberInput(parseNumberInput(valor) / parseNumberInput(numeroParcelas)) : '0,00'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {tipo === 'receita' && (
            <div className={styles.field}>
              <label htmlFor="conta-receita" className={styles.label}>Conta *</label>
              <select
                id="conta-receita"
                className={styles.select}
                value={contaId}
                onChange={(e) => { clearFieldError('contaId'); setContaId(e.target.value); }}
                disabled={loading || contasAtivas.length === 0}
              >
                <option value="">Selecione uma conta</option>
                {contasAtivas.map((conta) => (
                  <option key={conta.id} value={conta.id}>
                    {conta.nome} ({conta.tipo === 'corrente' ? 'Corrente' : conta.tipo === 'poupanca' ? 'Poupança' : 'Investimento'})
                  </option>
                ))}
              </select>
              {fieldErrors.contaId && <p className={styles.fieldError}>{fieldErrors.contaId}</p>}
              {contasAtivas.length === 0 && (
                <p className={styles.hint}>
                  Nenhuma conta cadastrada.{' '}
                  <button type="button" className={styles.hintLink} onClick={handleOpenContaForm} disabled={loading}>
                    Adicionar conta
                  </button>
                </p>
              )}
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="data" className={styles.label}>Data *</label>
            <input
              id="data"
              type="date"
              className={inputClassName(!!fieldErrors.data)}
              value={data}
              onChange={(e) => { clearFieldError('data'); setData(e.target.value); }}
              disabled={loading}
              max={new Date().toISOString().split('T')[0]}
            />
            {fieldErrors.data && <p className={styles.fieldError}>{fieldErrors.data}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="descricao" className={styles.label}>Descrição</label>
            <textarea
              id="descricao"
              className={styles.textarea}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição opcional do lançamento"
              rows={3}
              disabled={loading}
            />
          </div>

          {tipo === 'despesa' && (
            <div className={styles.field}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={pago} onChange={(e) => setPago(e.target.checked)} disabled={loading} />
                <span>Marcar como pago</span>
              </label>
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.btnGhost} onClick={handleClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? 'Salvando...' : isEditMode ? 'Salvar' : 'Criar Lançamento'}
            </button>
          </div>
        </form>
      </div>

      {showCartaoForm && (
        <div className={styles.nestedModalWrap} onClick={(e) => e.stopPropagation()}>
          <CartaoForm onClose={handleCloseCartaoForm} onSave={handleSaveCartao} />
        </div>
      )}

      {showContaForm && (
        <div className={styles.nestedModalWrap} onClick={(e) => e.stopPropagation()}>
          <ContaForm onClose={handleCloseContaForm} onSave={handleSaveConta} />
        </div>
      )}
    </div>
  );
}
