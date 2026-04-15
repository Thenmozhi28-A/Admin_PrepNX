import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { OrganizationResponse } from '../../types/Types';
import { API_BASE_URL } from '../../config/constants';

export const organizationApi = createApi({
  reducerPath: 'organizationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Organization'],
  endpoints: (builder) => ({
    getOrganization: builder.query<OrganizationResponse, string>({
      query: (id) => `/api/organisations/${id}`,
      providesTags: ['Organization'],
    }),

    updateOrganization: builder.mutation<any, { id: string; organization: FormData }>({
      query: ({ id, organization }) => ({
        url: `/api/organisations/${id}`,
        method: 'PUT',
        body: organization,
      }),
      invalidatesTags: ['Organization'],
    }),
  }),
});

export const { useGetOrganizationQuery, useUpdateOrganizationMutation } = organizationApi;
