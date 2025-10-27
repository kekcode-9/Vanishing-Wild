"use client";
import { createSlice } from "@reduxjs/toolkit";
import { current } from "@reduxjs/toolkit";

/**
 * state = {
 *  [facet: String]: String[]
 * }
 */
const nestedDropdownStateSlice = createSlice({
  name: "nestedDropdown", // this key is used internally for prefixing the action name to create a type
  initialState: {},
  reducers: {
    updateFacet: (state, action) => {
      const { facet, valuesArr } = action.payload;
      state[facet] = valuesArr;
    },
    insertUniqueValuesToFacet: (state, action) => {
      const { facet, valuesArr } = action.payload;
      const existingValues =
        Object.keys(state).length > 0 ? state[facet] : null;

      if (existingValues && existingValues.length > 0) {
        valuesArr.forEach((element) => {
          if (!existingValues.includes(element)) {
            existingValues.push(element);
          }
        });
        state[facet] = existingValues;
      } else {
        state[facet] = valuesArr;
      }
      console.log("state after update: ", current(state));
    },
    removeValuesFromFacet: (state, action) => {
      const { facet, value } = action.payload;
      const existingValues = Array.from(state[facet]);

      if (!existingValues.includes(value)) return state;
      
      existingValues.splice(existingValues.indexOf(value), 1);
      state[facet] = existingValues;
      console.log("state after update: ", current(state));
    },
    dropFacet: (state, action) => {
      const { facet } = action.payload;
      delete state[facet];
    },
    resetNestedDropdown: (state) => {
      return {};
    },
  },
});

export const {
  updateFacet,
  insertUniqueValuesToFacet,
  removeValuesFromFacet,
  dropFacet,
  resetNestedDropdown,
} = nestedDropdownStateSlice.actions;
export default nestedDropdownStateSlice.reducer;
