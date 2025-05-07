import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axios from 'axios';
import { clearCart, fetchCart, fetchCartFulfilled } from './cartSlice';
import { backendUrl } from './consts';


// const backendUrl = import.meta.env.VITE_BACKEND_URL;


// Custom Thunks
export const loginUser = (email, password) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.post(
      `${backendUrl}/users/login`,
      { email, password },
      { withCredentials: true }
    );

    if (response.data.success) {
      console.log("User login response :",response)
      dispatch(setUser(response.data.data));
      dispatch(setAuth(true));

      // dispatch(checkAuthStatus())
      dispatch(fetchCartFulfilled(response.data.data.cartData));
      return true
    } else{
      throw new Error(" Login failed")
    }
  } catch (error) {
    // console.error(error.response.data.message)
    console.error(error)
    dispatch(setError(error.message));
    toast.error(error.response.data.message);
  } finally {
    dispatch(setLoading(false));
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
      dispatch(resetUser());
      dispatch(setAuth(false));
      toast.success("User logged out")

    }
  } catch (error) {
    toast.error(error.response.data.message);
  }
};

export const checkAuthStatus = () => async (dispatch) => {

  try {
    const response = await axios.get(
      `${backendUrl}/users/check-auth`,
      { withCredentials: true }
    );

    // console.log("Auth check response:", response)

    if (response.status === 200) {

      dispatch(setUser(response.data.data.user));
      dispatch(setAuth(true));
      dispatch(fetchCart());

    }
    return true
  } catch (error) {

       dispatch(clearCart())
       dispatch(resetUser());
       dispatch(setAuth(false));

      //  toast.error(error.response.data.message) what about the case when user is not logged in or there is no token.
      console.error(error);

  }  finally {
    dispatch(setLoading(false));
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
export const {
  clearError,
  resetUser,
  setLoading,
  setError,
  setAuth,
  setUser } = userSlice.actions;

// Reducer
export default userSlice.reducer;
