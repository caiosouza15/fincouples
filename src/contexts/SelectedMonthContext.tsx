import { createContext, useContext, useState, type ReactNode } from 'react';

interface SelectedMonthContextType {
  selectedMonth: string; // formato YYYY-MM
  setSelectedMonth: (month: string) => void;
  getCurrentMonth: () => string;
}

const SelectedMonthContext = createContext<SelectedMonthContextType | undefined>(undefined);

export function SelectedMonthProvider({ children }: { children: ReactNode }) {
  // Função para obter mês atual
  const getCurrentMonth = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());

  const value: SelectedMonthContextType = {
    selectedMonth,
    setSelectedMonth,
    getCurrentMonth,
  };

  return (
    <SelectedMonthContext.Provider value={value}>
      {children}
    </SelectedMonthContext.Provider>
  );
}

export function useSelectedMonth() {
  const context = useContext(SelectedMonthContext);
  if (context === undefined) {
    throw new Error('useSelectedMonth deve ser usado dentro de um SelectedMonthProvider');
  }
  return context;
}
