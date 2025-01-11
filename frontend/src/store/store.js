import { configureStore } from '@reduxjs/toolkit';
import shopSlice from './shopSlice';
import cartSlice from './cartSlice';
import userSlice from './userSlice';

export const store = configureStore({
  reducer: {
    shop: shopSlice,
    cart: cartSlice,
    user: userSlice,
  },
});
