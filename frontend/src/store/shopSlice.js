import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const initialState = {
  products: [
    {
      _id: "1",
      name: "Pedigree",
      category: "Dog",
      image: [assets.dog_food],
      price: 15,
      type: "Food",
      bestseller: true
    },
    {
      _id: "2",
      name: "Thinganng",
      category: "Dog",
      image: [assets.dog_toy],
      price: 10,
      type: "Toys",
      bestseller: true
    },
    {
      _id: "3",
      name: "Bowtie",
      category: "Dog",
      image: [assets.dog_accessory],
      price: 50,
      type: "Accessories",
      bestseller: true
    },
    {
      _id: "4",
      name: "Whiskas",
      category: "Cat",
      image: [assets.cat_food],
      price: 15,
      type: "Food",
      bestseller: true
    },
    {
      _id: "5",
      name: "Houdong phanaba",
      category: "Cat",
      image: [assets.cat_toy],
      price: 10,
      type: "Toys",
      bestseller: true
    },
    {
      _id: "6",
      name: "Collar",
      category: "Cat",
      image: [assets.cat_accessory],
      price: 50,
      type: "Accessories",
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
    const response = await axios.get(`${backendUrl}/product/list`);
    if (response.success) {
      const products = response.data.products.reverse();
      dispatch(fetchProductsSuccess({ products }));
    } 
  } catch (error) {
    toast.error(error.message);
    dispatch(fetchProductsFailure({ error: error.message }));
  }
};

export default shopSlice.reducer;
