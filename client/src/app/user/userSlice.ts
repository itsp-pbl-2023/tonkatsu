import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOwner: false,
  roomId: "123456",
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
  },
});

export const { becomeOwner, createRoom } = userSlice.actions;

export default userSlice.reducer;
