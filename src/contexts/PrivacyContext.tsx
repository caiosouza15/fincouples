import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface PrivacyContextType {
  valuesHidden: boolean;
  toggleValuesVisibility: () => void;
  hidePoupancaInvestimento: boolean;
  setHidePoupancaInvestimento: (value: boolean) => void;
  sectionStates: Record<string, boolean>;
  toggleSectionPrivacy: (sectionKey: string) => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

const PRIVACY_STORAGE_KEY = 'privacy_values_hidden';
const HIDE_POUPANCA_KEY = 'privacy_hide_poupanca_investimento';
const SECTION_PRIVACY_KEY = 'privacy_section_states';

type SectionPrivacyStates = Record<string, boolean>;

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [valuesHidden, setValuesHidden] = useState<boolean>(() => {
    const stored = localStorage.getItem(PRIVACY_STORAGE_KEY);
    return stored === 'true';
  });

  const [hidePoupancaInvestimento, setHidePoupancaInvestimento] = useState<boolean>(() => {
    const stored = localStorage.getItem(HIDE_POUPANCA_KEY);
    return stored === 'true';
  });

  const [sectionStates, setSectionStates] = useState<SectionPrivacyStates>(() => {
    try {
      const stored = localStorage.getItem(SECTION_PRIVACY_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(PRIVACY_STORAGE_KEY, String(valuesHidden));
  }, [valuesHidden]);

  useEffect(() => {
    localStorage.setItem(HIDE_POUPANCA_KEY, String(hidePoupancaInvestimento));
  }, [hidePoupancaInvestimento]);

  useEffect(() => {
    localStorage.setItem(SECTION_PRIVACY_KEY, JSON.stringify(sectionStates));
  }, [sectionStates]);

  const toggleValuesVisibility = () => {
    setValuesHidden((prev) => !prev);
  };

  const toggleSectionPrivacy = useCallback((sectionKey: string) => {
    setSectionStates((prev) => ({
      ...prev,
      [sectionKey]: !(prev[sectionKey] ?? false),
    }));
  }, []);

  return (
    <PrivacyContext.Provider
      value={{
        valuesHidden,
        toggleValuesVisibility,
        hidePoupancaInvestimento,
        setHidePoupancaInvestimento,
        sectionStates,
        toggleSectionPrivacy,
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

export function useSectionPrivacy(sectionKey: string) {
  const { sectionStates, toggleSectionPrivacy } = usePrivacy();
  const hidden = sectionStates[sectionKey] ?? false;
  const toggle = () => toggleSectionPrivacy(sectionKey);
  return { hidden, toggle };
}
