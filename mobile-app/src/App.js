import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as StoreProvider, useSelector, useDispatch } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { PersistGate } from 'redux-persist/integration/react';
import { StatusBar } from 'react-native';
import { store, persistor } from './store/index.js';
import AppNavigator from './navigation/AppNavigator.js';
import { theme } from './theme.js';
import socketService from './services/socketService.js';

// Socket connection component
const SocketManager = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to socket with user ID
      socketService.connectSocket(user._id);
    } else {
      // Disconnect socket if not authenticated
      socketService.disconnectSocket();
    }
    
    // Cleanup on unmount
    return () => {
      socketService.disconnectSocket();
    };
  }, [isAuthenticated, user]);
  
  return null;
};

const AppContent = () => {
  useEffect(() => {
    // Hide splash screen on app load (removed react-native-splash-screen for Expo compatibility)
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
        <SocketManager />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const App = () => {
  return (
    <StoreProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider theme={theme}>
          <AppContent />
        </PaperProvider>
      </PersistGate>
    </StoreProvider>
  );
};

export default App;