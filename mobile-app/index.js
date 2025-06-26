<<<<<<< HEAD
=======
import 'react-native-gesture-handler';
>>>>>>> 4935994f15bb2f0ac41aae445393eba6e99356c1
import { registerRootComponent } from 'expo';
import App from './src/App.js';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';

<<<<<<< HEAD
registerRootComponent(
  <SafeAreaProvider>
    <PaperProvider>
      <App />
    </PaperProvider>
  </SafeAreaProvider>
);
=======
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
>>>>>>> 4935994f15bb2f0ac41aae445393eba6e99356c1
