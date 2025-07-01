import { useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Provider as PaperProvider } from "react-native-paper";
import { Stack } from "expo-router";
import { store, persistor } from "../store";
import { Colors } from "../constants/Colors";

// Create theme object
const theme = {
  ...Colors.light, // We'll add dark mode support later
  roundness: 4,
  version: 3,
};

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider theme={theme}>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: theme.primary,
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
