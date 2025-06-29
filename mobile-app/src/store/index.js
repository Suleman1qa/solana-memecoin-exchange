import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";
import authReducer from "./slices/authSlice.js";
import walletReducer from "./slices/walletSlice.js";
import marketReducer from "./slices/marketSlice.js";
import tokenReducer from "./slices/tokenSlice.js";
import stakingReducer from "./slices/stakingSlice.js";
import { rehydrateComplete } from "./slices/authSlice.js";
import apiClient, { setupApiClient } from "../services/apiClient.js";

console.log("🏗️ Initializing Redux store");

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth"],
  debug: __DEV__,
  // Blacklist specific fields from being persisted
  transforms: [
    {
      in: (state, key) => {
        if (key === "auth") {
          // Don't persist loading state
          const { isLoading, ...persistedState } = state;
          return persistedState;
        }
        return state;
      },
      out: (state, key) => {
        if (key === "auth") {
          // Ensure loading is false when rehydrating
          return { ...state, isLoading: false };
        }
        return state;
      },
    },
  ],
};

const rootReducer = combineReducers({
  auth: authReducer,
  wallet: walletReducer,
  market: marketReducer,
  token: tokenReducer,
  staking: stakingReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Simple logging middleware
const loggingMiddleware = () => (next) => (action) => {
  console.log("📊 Action:", action.type);
  return next(action);
};

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(loggingMiddleware),
  devTools: __DEV__,
});

// Setup API client
setupApiClient(store);

export const persistor = persistStore(store, null, () => {
  console.log("📦 Redux persist rehydration complete");
  // Ensure loading state is false after rehydration
  store.dispatch(rehydrateComplete());
});
