import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BillingResponse } from '../../types/Types';
import { API_BASE_URL } from '../../config/constants';

export const billingApi = createApi({
  reducerPath: 'billingApi',
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
  tagTypes: ['Billing'],
  endpoints: (builder) => ({
    getSubscription: builder.query<BillingResponse, string>({
      query: (id) => ({
        url: `/api/price-plans/subscription/${id}`,
        method: 'GET',
      }),
      providesTags: ['Billing'],
    }),
    getPricePlans: builder.query<any, { page: number; size: number; type: string }>({
      query: ({ page, size, type }) => ({
        url: `/api/price-plans?page=${page}&size=${size}&type=${type}`,
        method: 'GET',
      }),
      providesTags: ['Billing'],
    }),
  }),
});

export const { useGetSubscriptionQuery, useGetPricePlansQuery } = billingApi;

