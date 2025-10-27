"use client";
import { createSlice } from "@reduxjs/toolkit";

/**
 * selections: {
 *  // name is a value from the focused facet
 *  [name: string]: {
 *      thumbnail: {
 *          src: string, // an url
 *          width: number,
 *          height: number
 *      }
 *      extract: string,
 *      pageSrc: string
 *  }
 * }
 */
const initialState = {
    focusFacet: null,
    selections: {},
    country: null,
    isUpdating: false
}

const aboutTaxonSlice = createSlice({
    name: "aboutTaxon",
    initialState,
    reducers: {
        updateFocus: (state, action) => {
            state.focusFacet = action.payload;
        },
        updateSelections: (state, action) => {
            state.selections = {
                // ...state.selections,
                ...action.payload
            }
        },
        updateCountry: (state, action) => {
            state.country = action.payload;
        },
        toggleUpdatingStatus: (state, action) => {
            state.isUpdating = action.payload;
        },
        resetTaxonInfo: (state, action) => {
            state.selections = {};
            state.country = null;
            state.focusFacet = null
        }
    }
});

export const {
    updateFocus,
    updateSelections,
    updateCountry,
    toggleUpdatingStatus,
    resetTaxonInfo
} = aboutTaxonSlice.actions;
export default aboutTaxonSlice.reducer;