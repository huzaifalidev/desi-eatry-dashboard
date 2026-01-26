// src/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/redux/slices/auth-slice';
import menuReducer from '@/redux/slices/menu-slice';
import customerReducer from '@/redux/slices/customer-slice';
import adminReducer from '@/redux/slices/admin-slice';

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
  whitelist: ['admin','menu','customer'], // persist only auth slice
};

// Wrap your auth reducer with persistReducer
const persistedAdminReducer = persistReducer(persistConfig, adminReducer);
const persistedMenuReducer = persistReducer(persistConfig, menuReducer);
const persistedCustomerReducer = persistReducer(persistConfig, customerReducer);

// ---------------- Configure Store ----------------
export const store = configureStore({
  reducer: {
    admin: persistedAdminReducer,
    menu: persistedMenuReducer,
    customer: persistedCustomerReducer,
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
