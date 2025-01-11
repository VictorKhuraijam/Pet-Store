import { createSlice } from '@reduxjs/toolkit';
import { toast } from "react-toastify";
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Custom Thunks
export const fetchCart = () => async (dispatch) => {
  dispatch(fetchCartPending());
  try {
    const response = await axios.get(`${backendUrl}/api/cart/get`, {
      withCredentials: true // Important for sending cookies
    });
    if (response.data.success) {
      dispatch(fetchCartFulfilled(response.data.cartData));
    } else {
      dispatch(fetchCartRejected(response.data.message));
    }
  } catch (error) {
    toast.error(error.message);
    dispatch(fetchCartRejected(error.message));
  }
};

export const addToCartAsync = (itemId, size) => async (dispatch) => {
  try {
    const response = await axios.post(
      `${backendUrl}/api/cart/add`,
      { itemId, size },
      { withCredentials: true }
    );
    if (response.data.success) {
      dispatch(addToCartFulfilled({ itemId, size }));
    } else {
      toast.error(response.data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
};

export const updateQuantityAsync = (itemId, size, quantity) => async (dispatch) => {
  try {
    const response = await axios.post(
      `${backendUrl}/api/cart/update`,
      { itemId, size, quantity },
      { withCredentials: true }
    );
    if (response.data.success) {
      dispatch(updateQuantityFulfilled({ itemId, size, quantity }));
    } else {
      toast.error(response.data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
};

// Initial State
const initialState = {
  items: {},
  loading: false,
  error: null
};

// Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    fetchCartPending: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCartFulfilled: (state, action) => {
      state.loading = false;
      state.items = action.payload;
    },
    fetchCartRejected: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addToCartFulfilled: (state, action) => {
      const { itemId, size } = action.payload;
      if (!state.items[itemId]) {
        state.items[itemId] = {};
      }
      state.items[itemId][size] = (state.items[itemId][size] || 0) + 1;
    },
    updateQuantityFulfilled: (state, action) => {
      const { itemId, size, quantity } = action.payload;
      state.items[itemId][size] = quantity;
    },
    clearCart: (state) => {
      state.items = {};
    }
  }
});

// Selectors
export const getCartCount = (state) => {
  let totalCount = 0;
  const cartItems = state.cart.items;

  for (const itemId in cartItems) {
    for (const size in cartItems[itemId]) {
      if (cartItems[itemId][size] > 0) {
        totalCount += cartItems[itemId][size];
      }
    }
  }
  return totalCount;
};

export const selectCartAmount = (state) => {
  let totalAmount = 0;
  const cartItems = state.cart.items;
  const products = state.shop.products;

  for (const itemId in cartItems) {
    const itemInfo = products.find((product) => product._id === itemId);
    if (itemInfo) {
      for (const size in cartItems[itemId]) {
        if (cartItems[itemId][size] > 0) {
          totalAmount += itemInfo.price * cartItems[itemId][size];
        }
      }
    }
  }
  return totalAmount;
};

export const {
  fetchCartPending,
  fetchCartFulfilled,
  fetchCartRejected,
  addToCartFulfilled,
  updateQuantityFulfilled,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;
