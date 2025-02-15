import { createSlice } from '@reduxjs/toolkit';
import { toast } from "react-toastify";
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Custom Thunks
export const fetchCart = () => async (dispatch) => {
  dispatch(fetchCartPending());
  try {
    const response = await axios.get(`${backendUrl}/cart/get`, {
      withCredentials: true // Important for sending cookies
    });
      console.log('Fetched cart response:',response.data)

     if(response.data.success){
      dispatch(fetchCartFulfilled(response.data.data));
     } else {
      throw new Error("Failed to fetch cart")
     }
  } catch (error) {
    console.error(error)
    dispatch(fetchCartRejected(error.message));
  }
};

export const addToCart = (itemId) => async (dispatch) => {
  try {
    const response = await axios.post(
      `${backendUrl}/cart/add`,
      { itemId },
      { withCredentials: true }
    );

      dispatch(addToCartFulfilled({ itemId, cartData: response.data}));

  } catch (error) {
    toast.error( error.message);
  }
};

export const updateQuantity = (itemId,  quantity) => async (dispatch) => {
  try {
    const response = await axios.post(
      `${backendUrl}/cart/update`,
      { itemId, quantity: Number(quantity) },
      { withCredentials: true }
    );
    if (response.data.success)
      dispatch(updateQuantityFulfilled({
        itemId,
        quantity,
        cartData: response.data.data
      }));

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
      const { itemId} = action.payload;
      state.items[itemId] = (state.items[itemId] || 0) + 1;
    },
    updateQuantityFulfilled: (state, action) => {
      const { itemId, quantity } = action.payload;
      console.log('Updating quantity in state:', itemId, quantity);
      if (quantity > 0) {
        state.items[itemId] = quantity;
      } else {
        delete state.items[itemId];
      }
    },
    clearCart: (state) => {
      state.items = {};
    }
  }
});

// Selectors
export const getCartCount = (state) => {
  if (!state?.cart?.items) return 0;

  let totalCount = 0;
  const cartItems = state.cart.items;

  for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        totalCount += cartItems[itemId];
      }
  }
  return totalCount;
};

export const selectCartAmount = (state) => {
  let totalAmount = 0;
  const cartItems = state.cart.items;
  const products = state.shop.products;

  for (const itemId in cartItems) {
    const product = products.find((product) => product._id === itemId);
    if (product && cartItems[itemId] > 0 ) {

          totalAmount += product.price * cartItems[itemId];

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
