import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from './api/authApi';
import { notifiApi } from './api/notifiApi';
import { organizationApi } from './api/organizationApi';
import { userApi } from './api/userApi';
import { permissionApi } from './api/permissionApi';
import { rolesApi } from './api/rolesApi';
import { billingApi } from './api/billingApi';
import { emailApi } from './api/emailApi';
import { auditApi } from './api/auditApi';
import { profileApi } from './api/profileApi';
import onlineStatusReducer from './slices/onlineStatusSlice';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [notifiApi.reducerPath]: notifiApi.reducer,
    [organizationApi.reducerPath]: organizationApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [permissionApi.reducerPath]: permissionApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
    [billingApi.reducerPath]: billingApi.reducer,
    [emailApi.reducerPath]: emailApi.reducer,
    [auditApi.reducerPath]: auditApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    onlineStatus: onlineStatusReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      notifiApi.middleware,
      organizationApi.middleware,
      userApi.middleware,
      permissionApi.middleware,
      rolesApi.middleware,
      billingApi.middleware,
      emailApi.middleware,
      auditApi.middleware,
      profileApi.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
