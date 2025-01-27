import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';
// import { assets } from '../assets/assets';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const initialState = {
  // products: [
  //   {
  //     _id: "1",
  //     name: "Pedigree",
  //     category: "Dog",
  //     image: [assets.dog_food],
  //     price: 15,
  //     type: "Food",
  //     bestseller: true
  //   },
  //   {
  //     _id: "2",
  //     name: "Thinganng",
  //     category: "Dog",
  //     image: [assets.dog_toy],
  //     price: 10,
  //     type: "Toys",
  //     bestseller: true
  //   },
  //   {
  //     _id: "3",
  //     name: "Bowtie",
  //     category: "Dog",
  //     image: [assets.dog_accessory],
  //     price: 50,
  //     type: "Accessories",
  //     bestseller: true
  //   },
  //   {
  //     _id: "4",
  //     name: "Whiskas",
  //     category: "Cat",
  //     image: [assets.cat_food],
  //     price: 15,
  //     type: "Food",
  //     bestseller: true
  //   },
  //   {
  //     _id: "5",
  //     name: "Houdong phanaba",
  //     category: "Cat",
  //     image: [assets.cat_toy],
  //     price: 10,
  //     type: "Toys",
  //     bestseller: true
  //   },
  //   {
  //     _id: "6",
  //     name: "Collar",
  //     category: "Cat",
  //     image: [assets.cat_accessory],
  //     price: 50,
  //     type: "Accessories",
  //     bestseller: false
  //   },
  // ],
  products: [],
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
      const newProducts = action.payload.products;

      const existingProductIds = state.products.map((product) => product._id);
      const updatedProducts = newProducts.filter(
        (newProduct) => !existingProductIds.includes(newProduct._id)
      );

      if (updatedProducts.length > 0) {
        state.products.push(...updatedProducts);
      }
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
    const response = await axios.get(`${backendUrl}/products/list`);
    if (response.data.success) {
      console.log("Response fronm backend for products list: ",response.data)
      const products = response.data.data.products;
      console.log("the Products send to redux: ", products)
      dispatch(fetchProductsSuccess({ products }));
    }
  } catch (error) {
    toast.error(error.message);
    dispatch(fetchProductsFailure({ error: error.message }));
  }
};

export const fetchProductById = (productId) => async (dispatch) => {
  dispatch(fetchProductsStart())

  try {
    const response = await axios.get(
      `${backendUrl}/products/${productId}`
    )
    if(response.data.success){
      const product = response.data.data;
      console.log(product)
      dispatch(fetchProductsSuccess({products: [product]}))
    }
  } catch (error) {
    toast.error(error.message)
    dispatch(fetchProductsFailure({error: error.message}))
  }
}

export default shopSlice.reducer;
