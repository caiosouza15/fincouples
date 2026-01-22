import type { Categoria } from "@/types";

const STORAGE_KEY = 'fincouples_categorias';

function loadFromStorage(): Categoria[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveToStorage(categorias: Categoria[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(categorias));
    } catch {
        console.error('Erro ao salvar categorias no localStorage');
    }
}

export async function getCategorias(): Promise<Categoria[]> {
    const categorias = loadFromStorage();
    
    // Se não houver categorias, inicializar com padrões
    if (categorias.length === 0) {
        const padroes = initCategoriasPadrao();
        saveToStorage(padroes);
        return padroes;
    }
    
    return categorias;
}

export async function createCategoria(categoria: Omit<Categoria, 'id'>): Promise<Categoria> {
    const categorias = loadFromStorage();
    
    // Validar duplicatas
    const duplicada = categorias.find(
        c => c.nome.toLowerCase() === categoria.nome.toLowerCase().trim() && 
             c.tipo === categoria.tipo
    );
    
    if (duplicada) {
        throw new Error('Já existe uma categoria com este nome e tipo');
    }
    
    const newCategoria: Categoria = {
        ...categoria,
        id: crypto.randomUUID(),
        nome: categoria.nome.trim(),
    };
    
    categorias.push(newCategoria);
    saveToStorage(categorias);
    return newCategoria;
}

export async function updateCategoria(id: string, categoria: Partial<Categoria>): Promise<Categoria> {
    const categorias = loadFromStorage();
    const index = categorias.findIndex(c => c.id === id);
    
    if (index === -1) {
        throw new Error('Categoria não encontrada');
    }
    
    // Se for categoria padrão, não permitir alterar o tipo
    if (categorias[index].id.startsWith('padrao-') && categoria.tipo && categoria.tipo !== categorias[index].tipo) {
        throw new Error('Não é possível alterar o tipo de uma categoria padrão');
    }
    
    // Validar duplicatas (se estiver alterando nome ou tipo)
    if (categoria.nome || categoria.tipo) {
        const novoNome = (categoria.nome || categorias[index].nome).toLowerCase().trim();
        const novoTipo = categoria.tipo || categorias[index].tipo;
        
        const duplicada = categorias.find(
            (c, i) => i !== index && 
                      c.nome.toLowerCase() === novoNome && 
                      c.tipo === novoTipo
        );
        
        if (duplicada) {
            throw new Error('Já existe uma categoria com este nome e tipo');
        }
    }
    
    categorias[index] = {
        ...categorias[index],
        ...categoria,
        nome: categoria.nome ? categoria.nome.trim() : categorias[index].nome,
    };
    
    saveToStorage(categorias);
    return categorias[index];
}

export async function deleteCategoria(id: string): Promise<void> {
    const categorias = loadFromStorage();
    
    // Proteger categorias padrão
    if (id.startsWith('padrao-')) {
        throw new Error('Não é possível excluir uma categoria padrão');
    }
    
    const index = categorias.findIndex(c => c.id === id);
    if (index === -1) {
        throw new Error('Categoria não encontrada');
    }
    
    categorias.splice(index, 1);
    saveToStorage(categorias);
}

function initCategoriasPadrao(): Categoria[] {
    return [
        // Despesas
        { id: 'padrao-moradia', nome: 'Moradia', tipo: 'despesa' as const, cor: '#ef4444', icone: '🏠' },
        { id: 'padrao-alimentacao', nome: 'Alimentação', tipo: 'despesa' as const, cor: '#ef4444', icone: '🍽️' },
        { id: 'padrao-transporte', nome: 'Transporte', tipo: 'despesa' as const, cor: '#f97316', icone: '🚗' },
        { id: 'padrao-saude', nome: 'Saúde', tipo: 'despesa' as const, cor: '#ef4444', icone: '💊' },
        { id: 'padrao-educacao', nome: 'Educação', tipo: 'despesa' as const, cor: '#3b82f6', icone: '🎓' },
        { id: 'padrao-compras', nome: 'Compras', tipo: 'despesa' as const, cor: '#f97316', icone: '🛒' },
        { id: 'padrao-contas', nome: 'Contas', tipo: 'despesa' as const, cor: '#ef4444', icone: '💰' },
        { id: 'padrao-lazer', nome: 'Lazer', tipo: 'despesa' as const, cor: '#3b82f6', icone: '🎮' },
        { id: 'padrao-roupas', nome: 'Roupas', tipo: 'despesa' as const, cor: '#f97316', icone: '👕' },
        { id: 'padrao-assinaturas', nome: 'Assinaturas', tipo: 'despesa' as const, cor: '#3b82f6', icone: '📱' },
        // Receitas
        { id: 'padrao-salario', nome: 'Salário', tipo: 'receita' as const, cor: '#22c55e', icone: '💼' },
        { id: 'padrao-outras-receitas', nome: 'Outras Receitas', tipo: 'receita' as const, cor: '#22c55e', icone: '💵' },
        { id: 'padrao-presentes', nome: 'Presentes', tipo: 'receita' as const, cor: '#22c55e', icone: '🎁' },
        { id: 'padrao-rendimentos', nome: 'Rendimentos', tipo: 'receita' as const, cor: '#22c55e', icone: '💰' },
    ];
}
