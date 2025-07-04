import { useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Provider as PaperProvider, MD3LightTheme } from "react-native-paper";
import { Stack } from "expo-router";
import { store, persistor } from "../store";
import { Colors } from "../constants/Colors";

// Create theme object that extends MD3LightTheme
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.light.primary,
    secondary: Colors.light.secondary,
    background: Colors.light.background,
    surface: Colors.light.card,
    onSurface: Colors.light.text,
    outline: Colors.light.border,
    notification: Colors.light.notification,
    error: Colors.light.error,
    success: Colors.light.success,
  },
  // The version is already set correctly in MD3LightTheme
};

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider theme={theme}>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: theme.colors.primary,
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          >
            <Stack.Screen
              name="(auth)"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
}
