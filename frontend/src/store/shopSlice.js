import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const initialState = {
  products: [],
  loading: false,
  error: null,
  currency: '$',
  delivery_fee: 10,
  search: '',
  showSearch: false,
};

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    fetchProductsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProductsSuccess: (state, action) => {
      state.loading = false;
      state.products = action.payload.products;
    },
    fetchProductsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload.error;
    },
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setShowSearch: (state, action) => {
      state.showSearch = action.payload;
    },
  },
});

export const {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
  setSearch,
  setShowSearch,
} = shopSlice.actions;

export const fetchProducts = () => async (dispatch) => {
  dispatch(fetchProductsStart());
  try {
    const response = await axios.get(`${backendUrl}/api/product/list`);
    if (response.data.success) {
      const products = response.data.products.reverse();
      dispatch(fetchProductsSuccess({ products }));
    } else {
      dispatch(fetchProductsFailure({ error: response.data.message }));
    }
  } catch (error) {
    toast.error(error.message);
    dispatch(fetchProductsFailure({ error: error.message }));
  }
};

export default shopSlice.reducer;
