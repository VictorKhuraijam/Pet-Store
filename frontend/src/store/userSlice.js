import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axios from 'axios';
import { clearCart, fetchCart, fetchCartFulfilled } from './cartSlice';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Custom Thunks
export const loginUser = (email, password) => async (dispatch) => {
  dispatch(userSlice.actions.setLoading(true));
  try {
    const response = await axios.post(
      `${backendUrl}/users/login`,
      { email, password },
      { withCredentials: true } // Important for receiving cookies
    );

    if (response.data.success) {

      dispatch(setUser(response.data.data));
      dispatch(setAuth(true));

      // dispatch(checkAuthStatus())
      dispatch(fetchCartFulfilled(response.data.data.cartData));

    } else{
      throw new Error(" Login failed")
    }
  } catch (error) {
    dispatch(userSlice.actions.setError(error.message));
    toast.error(error.message);
  } finally {
    dispatch(userSlice.actions.setLoading(false));
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    const response = await axios.post(
      `${backendUrl}/users/logout`,
      {},
      { withCredentials: true }
    );

    if (response.data.success) {
      dispatch(clearCart());
      dispatch(userSlice.actions.resetUser());
    }
  } catch (error) {
    toast.error(error.message);
  }
};

export const checkAuthStatus = () => async (dispatch) => {
  try {
    const response = await axios.get(
      `${backendUrl}/users/current-user`,
      { withCredentials: true }
    );

    console.log("Auth check response:", response)

    if (response.data.success) {

      dispatch(setUser(response.data.data));
      dispatch(setAuth(true));
      // dispatch(userSlice.actions.setUser(response.data.data));
      // dispatch(userSlice.actions.setAuth(true));

      dispatch(fetchCart());

    }
  } catch (error) {
    dispatch(userSlice.actions.setAuth(false));
    console.error(error.message)
  }  finally {
    dispatch(userSlice.actions.setLoading(false));
  }
};

// Initial State
const initialState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    setAuth: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Actions
export const { clearError, resetUser, setAuth, setUser } = userSlice.actions;

// Reducer
export default userSlice.reducer;
