import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import authReducer from './slices/authSlice.js';
import walletReducer from './slices/walletSlice.js';
import marketReducer from './slices/marketSlice.js';
import tokenReducer from './slices/tokenSlice.js';
import stakingReducer from './slices/stakingSlice.js';
import apiClient, { setupApiClient } from '../services/apiClient.js';
import { refreshToken, logout } from './slices/authSlice.js';


const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // only auth will be persisted
};

const rootReducer = combineReducers({
  auth: authReducer,
  wallet: walletReducer,
  market: marketReducer,
  token: tokenReducer,
  staking: stakingReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Setup apiClient interceptors after store is created
setupApiClient(store, { refreshToken, logout });

export const persistor = persistStore(store);