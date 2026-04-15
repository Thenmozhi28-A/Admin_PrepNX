import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { NotificationResponse } from '../../types/Types';
import { API_BASE_URL } from '../../config/constants';

export const notifiApi = createApi({
  reducerPath: 'notifiApi',
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
  tagTypes: ['Notifications'],
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationResponse, void>({
      query: () => '/api/notifications',
      providesTags: ['Notifications'],
    }),
    markAsRead: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkAsReadMutation } = notifiApi;
