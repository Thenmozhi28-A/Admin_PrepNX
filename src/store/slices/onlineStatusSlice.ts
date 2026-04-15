import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface OnlineStatusState {
  onlineUsers: Record<string, boolean>; // userId -> isOnline
}

const initialState: OnlineStatusState = {
  onlineUsers: {},
};

const onlineStatusSlice = createSlice({
  name: 'onlineStatus',
  initialState,
  reducers: {
    setUserStatus: (state, action: PayloadAction<{ userId: string; isOnline: boolean }>) => {
      state.onlineUsers[action.payload.userId] = action.payload.isOnline;
    },
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload.reduce((acc, userId) => {
        acc[userId] = true;
        return acc;
      }, {} as Record<string, boolean>);
    },
  },
});

export const { setUserStatus, setOnlineUsers } = onlineStatusSlice.actions;
export default onlineStatusSlice.reducer;
