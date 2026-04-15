import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { UserResponse } from '../../types/Types';
import { API_BASE_URL } from '../../config/constants';

export const userApi = createApi({
  reducerPath: 'userApi',
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
  tagTypes: ['Users'],
  endpoints: (builder) => ({
    getUsers: builder.query<UserResponse, { page: number; size: number }>({
      query: ({ page, size }) => ({
        url: `/api/users?page=${page}&size=${size}`,
        method: 'GET',
      }),
      providesTags: ['Users'],
    }),
    addUser: builder.mutation<any, any>({
      query: (newUser) => ({
        url: '/api/users',
        method: 'POST',
        body: newUser,
      }),
      invalidatesTags: ['Users'],
    }),
    updateUser: builder.mutation<any, { id: string; user: any }>({
      query: ({ id, user }) => ({
        url: `/api/users/${id}`,
        method: 'PUT',
        body: user,
      }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
    uploadUsers: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: '/api/organisations/users/bulk-upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Users'],
    }),
  }),
});

export const { 
  useGetUsersQuery, 
  useAddUserMutation, 
  useUpdateUserMutation, 
  useDeleteUserMutation,
  useUploadUsersMutation 
} = userApi;

