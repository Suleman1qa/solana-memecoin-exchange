import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authSlice } from "./slices/authSlice";
import { walletSlice, fetchWallets } from "./slices/walletSlice";
import { marketSlice, fetchUserOrders } from "./slices/marketSlice";
import { tokenSlice } from "./slices/tokenSlice";

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "wallet"], // Only persist auth and wallet state
};

const persistedAuthReducer = persistReducer(persistConfig, authSlice.reducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    wallet: walletSlice.reducer,
    market: marketSlice.reducer,
    token: tokenSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { fetchWallets, fetchUserOrders };
