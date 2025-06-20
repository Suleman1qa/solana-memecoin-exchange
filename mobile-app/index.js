import { registerRootComponent } from 'expo';
import App from './src/App.js';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';

registerRootComponent(
  <SafeAreaProvider>
    <PaperProvider>
      <App />
    </PaperProvider>
  </SafeAreaProvider>
);