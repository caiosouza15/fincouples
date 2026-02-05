import type { CartaoCredito } from "@/types";

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

export async function getCartoes(): Promise<CartaoCredito[]> {
    return loadFromStorage();
}

export async function createCartao(cartao: Omit<CartaoCredito, 'id'>): Promise<CartaoCredito> {
    const cartoes = loadFromStorage();
    const newCartao: CartaoCredito = {
        ...cartao,
        id: crypto.randomUUID(),
        limiteDisponivel: cartao.limite - (cartao.faturaAtual || 0),
    };
    cartoes.push(newCartao);
    saveToStorage(cartoes);
    return newCartao;
}

export async function updateCartao(id: string, cartao: Partial<CartaoCredito>): Promise<CartaoCredito> {
    const cartoes = loadFromStorage();
    const index = cartoes.findIndex(c => c.id === id);
    if (index !== -1) {
        const updatedCartao = { ...cartoes[index], ...cartao };
        // Recalcular limite disponível se necessário
        if (cartao.limite !== undefined || cartao.faturaAtual !== undefined) {
            updatedCartao.limiteDisponivel = updatedCartao.limite - (updatedCartao.faturaAtual || 0);
        }
        cartoes[index] = updatedCartao;
        saveToStorage(cartoes);
        return cartoes[index];
    }
    throw new Error('Cartão não encontrado');
}

export async function deleteCartao(id: string): Promise<void> {
    const cartoes = loadFromStorage();
    const index = cartoes.findIndex(c => c.id === id);
    if (index !== -1) {
        cartoes.splice(index, 1);
        saveToStorage(cartoes);
        return;
    }
    throw new Error('Cartão não encontrado');
}
