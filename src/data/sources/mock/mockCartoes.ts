import type { CartaoCredito } from '@/types';
import type { CartoesDataSource } from '@/data/contracts';

const STORAGE_KEY = 'fincouples_cartoes';

function loadFromStorage(): CartaoCredito[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage(cartoes: CartaoCredito[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartoes));
  } catch {
    console.error('Erro ao salvar cartões no localStorage');
  }
}

export const mockCartoes: CartoesDataSource = {
  async getCartoes() {
    return loadFromStorage();
  },
  async createCartao(cartao) {
    const cartoes = loadFromStorage();
    const newCartao: CartaoCredito = {
      ...cartao,
      id: crypto.randomUUID(),
      limiteDisponivel: cartao.limite - (cartao.faturaAtual || 0),
    };
    cartoes.push(newCartao);
    saveToStorage(cartoes);
    return newCartao;
  },
  async updateCartao(id, cartao) {
    const cartoes = loadFromStorage();
    const index = cartoes.findIndex((c) => c.id === id);
    if (index !== -1) {
      const updatedCartao = { ...cartoes[index], ...cartao };
      if (cartao.limite !== undefined || cartao.faturaAtual !== undefined) {
        updatedCartao.limiteDisponivel = updatedCartao.limite - (updatedCartao.faturaAtual || 0);
      }
      cartoes[index] = updatedCartao;
      saveToStorage(cartoes);
      return cartoes[index];
    }
    throw new Error('Cartão não encontrado');
  },
  async deleteCartao(id) {
    const cartoes = loadFromStorage();
    const index = cartoes.findIndex((c) => c.id === id);
    if (index !== -1) {
      cartoes.splice(index, 1);
      saveToStorage(cartoes);
      return;
    }
    throw new Error('Cartão não encontrado');
  },
};
