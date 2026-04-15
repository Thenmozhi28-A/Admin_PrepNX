import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { AuditLogResponse } from '../../types/Types';
import { API_BASE_URL } from '../../config/constants';

export const auditApi = createApi({
  reducerPath: 'auditApi',
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
  tagTypes: ['AuditLogs'],
  endpoints: (builder) => ({
    getAuditLogs: builder.query<AuditLogResponse, { organisationId: string; page: number; size: number }>({
      query: ({ organisationId, page, size }) => ({
        url: `/api/audit-logs`,
        params: { organisationId, page, size },
        method: 'GET',
      }),
      providesTags: ['AuditLogs'],
    }),
    blockIp: builder.mutation<any, { ip: string; reason: string }>({
      query: (body) => ({
        url: '/api/audit-logs/block-ip',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useGetAuditLogsQuery, useBlockIpMutation } = auditApi;

