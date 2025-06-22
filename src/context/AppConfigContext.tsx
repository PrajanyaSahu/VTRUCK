import React, { createContext, useEffect, useState, ReactNode, useContext } from 'react';
import axios from 'axios';

const BASE_URL = 'https://2maato.com/api';

type AppConfig = {
  webname: string;
  timezone: string;
  currency: string;
  otp_auth: string;
  show_dark: number;
  logo: string;
};

type AppConfigContextType = {
  config: AppConfig | null;
  loading: boolean;
};

const AppConfigContext = createContext<AppConfigContextType>({
  config: null,
  loading: true,
});

export const useAppConfig = () => useContext(AppConfigContext);

export const AppConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/settings`, {
          auth: { username: 'vtruck', password: 'secret@123' },
        });
        setConfig(res.data.data);
      } catch (err) {
        console.error('Failed to fetch app settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return (
    <AppConfigContext.Provider value={{ config, loading }}>
      {children}
    </AppConfigContext.Provider>
  );
};
