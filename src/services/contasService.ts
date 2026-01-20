import type { Conta } from "@/types";

const STORAGE_KEY = 'fincouples_contas';

function loadFromStorage(): Conta[] {
    try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
    } catch { 
        return [];
    }
}

function saveToStorage(contas: Conta[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(contas));
    } catch {
        console.error('Erro ao salvar contas no localStorage');
    }
}

export async function getContas(): Promise<Conta[]> {
    return loadFromStorage();
}
export async function createConta(conta: Omit<Conta, 'id'>): Promise<Conta> {
    const contas = loadFromStorage();
    const newConta = { ...conta, id: crypto.randomUUID() };
    contas.push(newConta);
    saveToStorage(contas);
    return newConta;
}
export async function updateConta(id: string, conta: Partial<Conta>): Promise<Conta> {
    const contas = loadFromStorage();
    const index = contas.findIndex(c => c.id === id);
    if (index !== -1) {
        contas[index] = { ...contas[index], ...conta };
        saveToStorage(contas);
        return contas[index];
    }
    throw new Error('Conta não encontrada');
}
export async function deleteConta(id: string): Promise<void> {
    const contas = loadFromStorage();
    const index = contas.findIndex(c => c.id === id);
    if (index !== -1) {
        contas.splice(index, 1);
        saveToStorage(contas);
        return;
    }
    throw new Error('Conta não encontrada');
}