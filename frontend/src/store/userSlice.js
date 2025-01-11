import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axios from 'axios';
import { clearCart, fetchCart } from './cartSllice';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Custom Thunks
export const loginUser = (email, password) => async (dispatch) => {
  dispatch(userSlice.actions.setLoading(true));
  try {
    const response = await axios.post(
      `${backendUrl}/api/user/login`,
      { email, password },
      { withCredentials: true } // Important for receiving cookies
    );

    if (response.data.success) {
      dispatch(fetchCart());
      dispatch(userSlice.actions.setUser(response.data.user));
      dispatch(userSlice.actions.setAuth(true));
    } else {
      dispatch(userSlice.actions.setError(response.data.message));
      toast.error(response.data.message);
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
      `${backendUrl}/api/user/logout`,
      {},
      { withCredentials: true }
    );

    if (response.data.success) {
      dispatch(clearCart());
      dispatch(userSlice.actions.resetUser());
    } else {
      toast.error(response.data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
};

export const checkAuthStatus = () => async (dispatch) => {
  try {
    const response = await axios.get(
      `${backendUrl}/api/user/check-auth`,
      { withCredentials: true }
    );

    if (response.data.success) {
      dispatch(fetchCart());
      dispatch(userSlice.actions.setUser(response.data.user));
      dispatch(userSlice.actions.setAuth(true));
    } else {
      dispatch(userSlice.actions.setAuth(false));
    }
  } catch (error) {
    dispatch(userSlice.actions.setAuth(false));
    toast.error(error.message);
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
export const { clearError } = userSlice.actions;

// Reducer
export default userSlice.reducer;
