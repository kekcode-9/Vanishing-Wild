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
                ...state.selections,
                ...action.payload
            }
        },
        updateCountry: (state, action) => {
            state.country = action.payload;
        }
    }
});

export const {
    updateFocus,
    updateSelections,
    updateCountry
} = aboutTaxonSlice.actions;
export default aboutTaxonSlice.reducer;