import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { EmailTemplateResponse } from '../../types/Types';
import { API_BASE_URL } from '../../config/constants';

export const emailApi = createApi({
  reducerPath: 'emailApi',
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
  tagTypes: ['EmailTemplates'],
  endpoints: (builder) => ({
    getEmailTemplates: builder.query<EmailTemplateResponse, void>({
      query: () => ({
        url: '/api/email-templates',
        method: 'GET',
      }),
      providesTags: ['EmailTemplates'],
    }),
    getEmailPreview: builder.query<any, string>({
      query: (id) => ({
        url: `/api/email-templates/${id}/preview`,
        method: 'GET',
      }),
    }),
    bulkSendEmail: builder.mutation<any, any>({
      query: (data) => ({
        url: '/api/email-templates/bulk-send',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { 
  useGetEmailTemplatesQuery, 
  useGetEmailPreviewQuery, 
  useBulkSendEmailMutation 
} = emailApi;

