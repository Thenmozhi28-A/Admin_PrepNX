import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ProfileResponse } from '../../types/Types';
import { API_BASE_URL } from '../../config/constants';

export const profileApi = createApi({
  reducerPath: 'profileApi',
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
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    getProfile: builder.query<ProfileResponse, void>({
      query: () => '/api/profile',
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<ProfileResponse, any>({
      query: (formData) => ({
        url: '/api/profile',
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi;
