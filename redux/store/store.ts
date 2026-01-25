// src/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/redux/slices/auth-slice';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; 

// ---------------- Persist Config ----------------
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // persist only auth slice
};

// Wrap your auth reducer with persistReducer
const persistedAuthReducer = persistReducer(persistConfig, authReducer);

// ---------------- Configure Store ----------------
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions to prevent warnings
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// ---------------- Persistor ----------------
export const persistor = persistStore(store);

// ---------------- TypeScript Types (optional but recommended) ----------------
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
