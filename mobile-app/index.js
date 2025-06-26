import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import App from './src/App.js';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';

function Root() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <App />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

registerRootComponent(Root);