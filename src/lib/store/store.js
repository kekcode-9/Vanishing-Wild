"use client";
import { configureStore } from "@reduxjs/toolkit";
import aboutTaxonReducer from "@/lib/store/features/about-selected-taxon/aboutTaxonSlice";
import nestedDropdownReducer from "@/lib/store/features/nested-dropdown-state/nestedDropdownStateSlice";

const store = configureStore({
    reducer: {
        aboutTaxon: aboutTaxonReducer,
        nestedDropdown: nestedDropdownReducer, // this key is used for accessing the state via useSelector
    }
})

export default store;