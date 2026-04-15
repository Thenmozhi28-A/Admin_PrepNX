import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RolesResponse } from '../../types/Types';
import { API_BASE_URL } from '../../config/constants';

export const rolesApi = createApi({
  reducerPath: 'rolesApi',
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
  tagTypes: ['Roles'],
  endpoints: (builder) => ({
    getRoles: builder.query<RolesResponse, void>({
      query: () => ({
        url: '/api/roles',
        method: 'GET',
      }),
      providesTags: ['Roles'],
    }),
    addRole: builder.mutation<any, any>({
      query: (newRole) => ({
        url: '/api/roles',
        method: 'POST',
        body: newRole,
      }),
      invalidatesTags: ['Roles'],
    }),
    updateRole: builder.mutation<any, { id: string; role: any }>({
      query: ({ id, role }) => ({
        url: `/api/roles/${id}`,
        method: 'PUT',
        body: role,
      }),
      invalidatesTags: ['Roles'],
    }),
    deleteRole: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Roles'],
    }),
  }),
});

export const { 
  useGetRolesQuery, 
  useAddRoleMutation, 
  useUpdateRoleMutation, 
  useDeleteRoleMutation 
} = rolesApi;

