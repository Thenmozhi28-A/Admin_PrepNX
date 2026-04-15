// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import { API_BASE_URL } from '../../config/constants';

// export const authApi = createApi({
//   reducerPath: 'authApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: API_BASE_URL,
//   }),
//   endpoints: (builder) => ({
//     login: builder.mutation({
//       query: (credentials) => ({
//         url: '/api/auth/login',
//         method: 'POST',
//         body: credentials,
//       }),
//     }),
//   }),
// });

// export const { useLoginMutation } = authApi;

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../config/constants';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL, // Should be: 'http://103.118.158.156:8088'
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/api/auth/login',  // ✅ correct path
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});

export const { useLoginMutation } = authApi;
