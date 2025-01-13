import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const initialState = {
  products: [
    {
      _id: "1",
      name: "Dog Food",
      image: [assets.dog_food],
      price: 15,
      category: "Food",
      bestseller: true
    },
    {
      _id: "2",
      name: "Dog Toy",
      image: [assets.dog_toy],
      price: 10,
      category: "Toys",
      bestseller: true
    },
    {
      _id: "3",
      name: "Dog Accessory",
      image: [assets.dog_accessory],
      price: 50,
      category: "Accessories",
      bestseller: true
    },
    {
      _id: "4",
      name: "Cat Food",
      image: [assets.cat_food],
      price: 15,
      category: "Food",
      bestseller: true
    },
    {
      _id: "5",
      name: "Cat Toy",
      image: [assets.cat_toy],
      price: 10,
      category: "Toys",
      bestseller: true
    },
    {
      _id: "6",
      name: "Cat Accessory",
      image: [assets.cat_accessory],
      price: 50,
      category: "Accessories",
      bestseller: false
    },
  ],
  loading: false,
  error: null,
  currency: '₹',
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
