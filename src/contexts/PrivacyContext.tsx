import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface PrivacyContextType {
  valuesHidden: boolean;
  toggleValuesVisibility: () => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

const PRIVACY_STORAGE_KEY = 'privacy_values_hidden';

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [valuesHidden, setValuesHidden] = useState<boolean>(() => {
    // Ler do localStorage na inicialização
    const stored = localStorage.getItem(PRIVACY_STORAGE_KEY);
    return stored === 'true';
  });

  useEffect(() => {
    // Persistir no localStorage sempre que o estado mudar
    localStorage.setItem(PRIVACY_STORAGE_KEY, String(valuesHidden));
  }, [valuesHidden]);

  const toggleValuesVisibility = () => {
    setValuesHidden((prev) => !prev);
  };

  return (
    <PrivacyContext.Provider
      value={{
        valuesHidden,
        toggleValuesVisibility,
      }}
    >
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error('usePrivacy deve ser usado dentro de um PrivacyProvider');
  }
  return context;
}
