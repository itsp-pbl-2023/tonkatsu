import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOwner: false,
  roomId: "123456",
  joinNum: 1,        // 部屋の人数
  gameCount: 0,      // ゲーム何周目?
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    becomeOwner: (state, action) => {
      state.isOwner = action.payload;
    },
    createRoom: (state, action) => {
      if (action.payload !== "") {
        state.roomId = action.payload;
      }
    },
    setJoinNum: (state, action) => {
      state.joinNum = action.payload
    },
    setGameCount: (state, action) => {
      state.gameCount = action.payload;
    },
  },
});

export const { becomeOwner, createRoom, setJoinNum, setGameCount } = userSlice.actions;

export default userSlice.reducer;
