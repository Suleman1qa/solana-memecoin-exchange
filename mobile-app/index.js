import "react-native-gesture-handler";
import { registerRootComponent } from "expo";
import App from "./src/App.js";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";

// Enable debugging
if (__DEV__) {
  const isRemoteDebuggingEnabled =
    typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION__;
  console.log("Remote debugging enabled:", isRemoteDebuggingEnabled);

  // Enable more detailed console logs
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    originalConsoleLog(...args);
    if (args[0]?.includes && args[0].includes("API")) {
      originalConsoleLog(new Error().stack);
    }
  };
}

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
