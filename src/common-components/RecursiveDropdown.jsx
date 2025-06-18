import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// redux-toolkit
import { useSelector, useDispatch } from "react-redux";
import {
  updateFacet,
  insertUniqueValuesToFacet,
  removeValuesFromFacet,
  dropFacet,
} from "@/lib/store/features/nested-dropdown-state/nestedDropdownStateSlice";
// import common components
import Checkbox from "./Checkbox";

/**
 type FacetedList = {
  [key: string]: {
    facet: string;
    isNested: boolean;
    subFacet: string | null;
    allowMultiple: boolean;
    mappings?: { [key: string]: string[] }[];
    options?: string[];
  };
};
 */

/**
 * A single RecursiveDropdown component is responsible for a single facet (facetKey) and
 * updating the selected values at that facet's level
 */
export default function RecursiveDropdown({
  facetKey, // String
  facetedList, // FacetedList
  selectedValues = [], // { [facet: string]: string }[], example: [{Family: "family1"}, {Family: "family2"}]
  onChange = () => {}, // (selected: { [facet: string]: string }) => void;
}) {
  const facet = facetedList[facetKey];
  const [selected, setSelected] = useState(null); // [Facet: String, values: String[]]
  const [lastSelection, setLastSelection] = useState(null); // String | Null
  const allowMultiple = useRef(false);

  const nestedDropdown = useSelector((state) => state.nestedDropdown);
  const dispatch = useDispatch();

  if (!facet) return null;

  useEffect(() => {
    allowMultiple.current = facetedList[facetKey].allowMultiple;
  }, [facetedList]);

  const selectedValuesArr = useMemo(() => {
    if (selectedValues.length === 0) return [];
    return selectedValues.map((selected, _) => Object.values(selected)[0]);
  }, [selectedValues]);

  const handleSelectionChange = useCallback(
    ([facet, value], toAdd = true) => {
      console.log("facet: ", facet, " | value: ", value, " | toAdd: ", toAdd);

      if (allowMultiple) {
        /**
         * when adding, inserts a unique value to the array of existing values for the facet
         * when deleting, removes a singular value from the array of existing values for the facet
         */
        if (toAdd) {
          dispatch(
            insertUniqueValuesToFacet({
              facet,
              valuesArr: [value],
            })
          );
        } else {
          facetedList[facetKey].mappings?.map((mapping, i) => {
            const [key, valuesArr] = Object.entries(mapping)[0];
            const subFacet = facetedList[facetKey].subFacet;
            
            value === key && valuesArr.forEach((nestedValue, _) => {
              if (nestedDropdown[subFacet].includes(nestedValue)) {
                dispatch(
                  removeValuesFromFacet({
                    facet: facetedList[facetKey].subFacet,
                    value: nestedValue
                  })
                )
              }
            })
          })
          dispatch(
            removeValuesFromFacet({
              facet,
              value,
            })
          );
        }
      } else {
        /**
         * completely overwrites the existing facet value when adding
         * completely deletes the facet when removing
         */
        if (toAdd) {
          dispatch(
            updateFacet({
              facet,
              valuesArr: [value],
            })
          );
        } else {
          dispatch(dropFacet({ facet }));
        }
      }

      toAdd && setLastSelection(value);
      onChange();
    },
    [selected, nestedDropdown]
  );

  const handleChildSelectionUpdate = (selection) => {
    onChange();
  };

  const facetExists = useMemo(() => {
    return Object.keys(nestedDropdown).length > 0 && facetKey in nestedDropdown;
  }, [nestedDropdown]);

  return (
    <div style={{ marginBottom: "1rem", marginLeft: "1rem" }}>
      <div
        onClick={() => {
          setSelected(null);
          //
          onChange();
        }}
      >
        Deselect all -{" "}
      </div>
      {Object.entries(selectedValues).length === 0 ? (
        <>
          {facetedList[facetKey].isNested
            ? facetedList[facetKey].mappings.map((mapping, i) => {
                const [key, valuesArr] = Object.entries(mapping)[0];
                const subFacet = facetedList[facetKey].subFacet;

                return (
                  <div key={key}>
                    <div onClick={() => handleSelectionChange([facetKey, key])}>
                      {facetExists > 0 &&
                        nestedDropdown[facetKey].includes(key) && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectionChange([facetKey, key], false);
                            }}
                          >
                            X
                          </span>
                        )}{" "}
                      {facetKey} - {key} - ({valuesArr.length})
                    </div>
                    {lastSelection === key && (
                      <RecursiveDropdown
                        facetKey={subFacet}
                        selectedValues={valuesArr.map((value, _) => ({
                          [subFacet]: value,
                        }))}
                        facetedList={facetedList}
                        onChange={handleChildSelectionUpdate}
                      />
                    )}
                  </div>
                );
              })
            : facetedList[facetKey].options.map((option, i) => {
                return (
                  <div
                    key={option}
                    onClick={() => handleSelectionChange([facetKey, option])}
                  >
                    {facetExists > 0 &&
                      nestedDropdown[facetKey].includes(key) && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectionChange([facetKey, option], false);
                          }}
                        >
                          X
                        </span>
                      )}{" "}
                    {facetKey} - {option}
                  </div>
                );
              })}
        </>
      ) : (
        <>
          {facetedList[facetKey].isNested
            ? facetedList[facetKey].mappings.map((mapping, i) => {
                const [key, valuesArr] = Object.entries(mapping)[0];
                const subFacet = facetedList[facetKey].subFacet;

                if (selectedValuesArr.includes(key)) {
                  return (
                    <div key={key}>
                      <div
                        onClick={() => handleSelectionChange([facetKey, key])}
                      >
                        {facetExists > 0 &&
                          nestedDropdown[facetKey].includes(key) && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectionChange([facetKey, key], false);
                              }}
                            >
                              X
                            </span>
                          )}{" "}
                        {facetKey} - {key} - ({valuesArr.length})
                      </div>
                      {lastSelection === key && (
                        <RecursiveDropdown
                          facetKey={subFacet}
                          selectedValues={valuesArr.map((value, _) => ({
                            [subFacet]: value,
                          }))}
                          facetedList={facetedList}
                          onChange={handleChildSelectionUpdate}
                        />
                      )}
                    </div>
                  );
                }
              })
            : facetedList[facetKey].options.map((option, key) => {
                if (selectedValuesArr.includes(option)) {
                  return (
                    <div
                      key={option}
                      onClick={() => handleSelectionChange([facetKey, option])}
                    >
                      {facetExists > 0 &&
                        nestedDropdown[facetKey].includes(option) && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectionChange([facetKey, option], false);
                            }}
                          >
                            X
                          </span>
                        )}{" "}
                      {facetKey} - {option}
                    </div>
                  );
                }
              })}
        </>
      )}
    </div>
  );
}
