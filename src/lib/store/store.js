"use client";
import { configureStore } from "@reduxjs/toolkit";
import nestedDropdownReducer from "@/lib/store/features/nested-dropdown-state/nestedDropdownStateSlice";

const store = configureStore({
    reducer: {
        nestedDropdown: nestedDropdownReducer, // this key is used for accessing the state via useSelector
    }
})

export default store;