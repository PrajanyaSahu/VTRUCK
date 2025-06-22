// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { LoadsProvider } from './src/context/LoadsContext';
import { routeToFileMap } from './src/constants/routeToFileMap';
import { AppConfigProvider } from './src/context/AppConfigContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'; // <- your i18n config file
import 'react-native-get-random-values';

const App = () => {
  const handleNavigationStateChange = (state: any) => {
    if (!state) return;

    const currentRoute = state.routes[state.index];
    const fileName = routeToFileMap[currentRoute.name] || 'Unknown File';
    console.log('You are in file:', fileName);
  };

  return (
    <I18nextProvider i18n={i18n}>
      <NavigationContainer onStateChange={handleNavigationStateChange}>
        <AppConfigProvider>
          <LoadsProvider>
            <AppNavigator />
          </LoadsProvider>
        </AppConfigProvider>
      </NavigationContainer>
    </I18nextProvider>
  );
};

export default App;
