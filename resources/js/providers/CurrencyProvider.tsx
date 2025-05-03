import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Currency } from '@/pages/Admin/Currencies/_components/types';
import axios from 'axios';

interface CurrencyContextType {
  defaultCurrency: Currency | null;
  setDefaultCurrency: React.Dispatch<React.SetStateAction<Currency | null>>;
  isLoading: boolean;
  formatCurrency: (amount: number | null | undefined, currency?: Currency) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
  initialCurrency?: Currency | null;
}

export function CurrencyProvider({ children, initialCurrency = null }: CurrencyProviderProps) {
  const [defaultCurrency, setDefaultCurrency] = useState<Currency | null>(initialCurrency);
  const [isLoading, setIsLoading] = useState<boolean>(initialCurrency === null);

  useEffect(() => {
    if (initialCurrency === null) {
      // Carregar a moeda padrão do sistema
      setIsLoading(true);

      axios.get('/api/settings/default-currency')
        .then(response => {
          setDefaultCurrency(response.data.currency);
        })
        .catch(error => {
          console.error('Erro ao carregar a moeda padrão:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [initialCurrency]);

  const formatCurrency = (amount: number | null | undefined, currency?: Currency): string => {
    if (amount === null || amount === undefined) return 'N/A';

    const currencyToUse = currency || defaultCurrency;

    // Se não tivermos uma moeda configurada, usar a formatação padrão
    if (!currencyToUse) {
      return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'MZN'
      }).format(amount);
    }

    // Usando as configurações da moeda específica
    const formattedValue = new Intl.NumberFormat('pt-PT', {
      minimumFractionDigits: currencyToUse.decimal_places,
      maximumFractionDigits: currencyToUse.decimal_places,
    }).format(amount)
      .replace(/\./g, '#')
      .replace(/,/g, '$')
      .replace(/#/g, currencyToUse.thousand_separator)
      .replace(/\$/g, currencyToUse.decimal_separator);

    return `${currencyToUse.symbol} ${formattedValue}`;
  };

  const value = {
    defaultCurrency,
    setDefaultCurrency,
    isLoading,
    formatCurrency,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
