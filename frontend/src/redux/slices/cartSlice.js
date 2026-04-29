import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const existingItem = state.items.find((item) => item._id === product._id);

      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          existingItem.quantity += 1;
        }
      } else {
        state.items.push({ ...product, quantity: 1 });
      }
    },
    updateQuantity: (state, action) => {
      const { id, delta } = action.payload;
      const item = state.items.find((item) => item._id === id);
      if (item) {
        const newQty = item.quantity + delta;
        if (newQty >= 1 && newQty <= item.stock) {
          item.quantity = newQty;
        }
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
