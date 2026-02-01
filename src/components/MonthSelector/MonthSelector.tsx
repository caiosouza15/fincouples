import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthSelectorProps {
  selectedMonth: string; // formato YYYY-MM
  onMonthChange: (month: string) => void;
  className?: string;
}

export const MonthSelector = ({ selectedMonth, onMonthChange, className = '' }: MonthSelectorProps) => {
  // Converter YYYY-MM para Date
  const getDateFromMonth = (month: string): Date => {
    const [year, monthNum] = month.split('-').map(Number);
    return new Date(year, monthNum - 1, 1);
  };

  // Formatar mês para exibição (ex: "Novembro 2024")
  const formatMonthDisplay = (month: string): string => {
    const date = getDateFromMonth(month);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  // Navegar para mês anterior
  const goToPreviousMonth = () => {
    const date = getDateFromMonth(selectedMonth);
    date.setMonth(date.getMonth() - 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${year}-${month}`);
  };

  // Navegar para próximo mês
  const goToNextMonth = () => {
    const date = getDateFromMonth(selectedMonth);
    date.setMonth(date.getMonth() + 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${year}-${month}`);
  };

  // Verificar se é o mês atual
  const isCurrentMonth = () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return selectedMonth === currentMonth;
  };

  // Verificar se está no header (pela className que contém "text-white")
  const isInHeader = className.includes('text-white');
  
  // Classes condicionais baseadas no contexto
  const buttonClass = isInHeader
    ? "bg-transparent border-none cursor-pointer p-xs text-white/90 hover:text-white transition-colors duration-200 flex items-center justify-center"
    : "bg-transparent border-none cursor-pointer p-xs text-text-secondary hover:text-text-primary transition-colors duration-200 flex items-center justify-center";
  
  const textClass = isInHeader
    ? "text-sm font-medium text-white min-w-[140px] text-center"
    : "text-sm font-medium text-text-primary min-w-[140px] text-center";
  
  const disabledButtonClass = isInHeader
    ? "bg-transparent border-none cursor-pointer p-xs text-white/50 hover:text-white/50 transition-colors duration-200 flex items-center justify-center opacity-50 cursor-not-allowed"
    : "bg-transparent border-none cursor-pointer p-xs text-text-secondary hover:text-text-primary transition-colors duration-200 flex items-center justify-center opacity-50 cursor-not-allowed";

  return (
    <div className={`flex items-center justify-center gap-md ${className}`}>
      <button
        onClick={goToPreviousMonth}
        className={buttonClass}
        aria-label="Mês anterior"
      >
        <ChevronLeft size={20} />
      </button>
      
      <span className={textClass}>
        {formatMonthDisplay(selectedMonth)}
      </span>
      
      <button
        onClick={goToNextMonth}
        disabled={isCurrentMonth()}
        className={isCurrentMonth() ? disabledButtonClass : buttonClass}
        aria-label="Próximo mês"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};
