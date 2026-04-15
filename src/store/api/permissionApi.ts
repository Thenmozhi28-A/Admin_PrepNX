import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { PermissionResponse } from '../../types/Types';
import { API_BASE_URL } from '../../config/constants';

export const permissionApi = createApi({
  reducerPath: 'permissionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL, // Uses direct URL instead of vite proxy
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getPermissions: builder.query<PermissionResponse, void>({
      query: () => ({
        url: '/api/permissions',
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetPermissionsQuery } = permissionApi;
