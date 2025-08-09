import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
// import icons
import CloseIcon from "@mui/icons-material/Close";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
// redux-toolkit
import { useSelector, useDispatch } from "react-redux";
import {
  updateFacet,
  insertUniqueValuesToFacet,
  removeValuesFromFacet,
  dropFacet,
} from "@/lib/store/features/nested-dropdown-state/nestedDropdownStateSlice";
import { toggleUpdatingStatus } from "@/lib/store/features/about-selected-taxon/aboutTaxonSlice";

const DropdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 20px;
  padding-left: 12px;
`;

const CapsuleItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  width: fit-content;
  height: fit-content;
  padding: 4px 8px;
  border-radius: 100px;
  border: 1px solid #ffffff45;
  cursor: pointer;
`;

const FacetNestingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 20px;
`;

const ClickableSpan = styled.span`
  cursor: pointer;
`;

const closeIconStyle = {
  width: "20px",
  height: "20px",
  cursor: "pointer",
  paddingLeft: "4px",
};

/**
 type FacetedList = {
  [key: string]: {
    facet: string;
    isNested: boolean;
    subFacet: string | null;
    allowMultiple: boolean;
    mappings?: { [key: string]: string[] }[]; // key is an item of current facet and values are subfacet items falling under the key item
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
  facetedList = [], // FacetedList
  selectedValues = [], // { [facet: string]: string }[], example: [{Family: "family1"}, {Family: "family2"}]
  onChange = () => {}, // (selected: { [facet: string]: string }) => void;
  externalSelection,
}) {
  const [lastSelection, setLastSelection] = useState(null); // String | Null
  const allowMultiple = useRef(false);
  const capsuleRefsArr = useRef([]);

  const nestedDropdown = useSelector((state) => state.nestedDropdown);
  const dispatch = useDispatch();

  useEffect(() => {
    if (facetedList.length === 0) return;
    allowMultiple.current = facetedList[facetKey].allowMultiple;
  }, [facetedList]);

  useEffect(() => {
    const facetChoice = externalSelection
      ? externalSelection.filter((item, _) => item.includes(facetKey))
      : [];

    if (facetChoice.length > 0) {
      const value = facetChoice[0].split(`${facetKey}-`)[1];
      setLastSelection(value);
      dispatch(
        insertUniqueValuesToFacet({
          facet: facetKey,
          valuesArr: [value],
        })
      );
      console.log("last selection updated to: ", value);
    }
  }, [externalSelection, facetKey]);

  useEffect(() => {
    if (!lastSelection) return;
    console.log("for scroll | lastSelection: ", lastSelection);
    console.log(
      "for scroll | facetedList[",
      facetKey,
      "]: ",
      facetedList[facetKey]
    );
    let index;
    if (facetedList[facetKey].isNested) {
      index = facetedList[facetKey]?.mappings?.findIndex(
        (map) => Object.entries(map)[0][0] === lastSelection
      );
    } else {
      index = facetExists[facetKey]?.options?.findIndex(
        (option) => option === lastSelection
      );
    }
    console.log(
      "for scroll | index: ",
      index,
      " | capsuleRefsArr has at index: ",
      capsuleRefsArr.current[index]
    );

    capsuleRefsArr.current[index]?.scrollIntoView({
      behavior: "smooth", // or 'auto'
      block: "end", // or 'start' / 'end'
    });
  }, [lastSelection, facetedList, facetKey]);

  const selectedValuesArr = useMemo(() => {
    if (selectedValues.length === 0) return [];
    return selectedValues.map((selected, _) => Object.values(selected)[0]);
  }, [selectedValues]);

  const removeNestedValues = (parentFacetValue, facet) => {
    console.log("parentFacet to remove: ", parentFacetValue);
    facetedList[facet].mappings?.map((mapping, i) => {
      const [key, valuesArr] = Object.entries(mapping)[0];
      const subFacet = facetedList[facet].subFacet;
      parentFacetValue === key &&
        valuesArr.forEach((nestedValue, _) => {
          if (nestedDropdown[subFacet]?.includes(nestedValue)) {
            removeNestedValues(nestedValue, subFacet);
            dispatch(
              removeValuesFromFacet({
                facet: facetedList[facet].subFacet,
                value: nestedValue,
              })
            );
          }
        });
    });
  };

  const handleSelectionChange = useCallback(
    ([facet, value], toAdd = true) => {
      console.log("facet: ", facet, " | value: ", value, " | toAdd: ", toAdd);
      dispatch(toggleUpdatingStatus(true));

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
          removeNestedValues(value, facetKey);
          dispatch(
            removeValuesFromFacet({
              facet,
              value,
            })
          );
          setLastSelection(null);
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
          setLastSelection(null);
        }
      }

      toAdd && setLastSelection(value);
      onChange(toAdd);
    },
    [nestedDropdown, facetKey]
  );

  const handleDeselctAll = (facetKey, selectedValuesArr) => {
    if (selectedValuesArr) {
      selectedValuesArr.forEach((value, _) => {
        removeNestedValues(value);
        dispatch(
          removeValuesFromFacet({
            facet: facetKey,
            value,
          })
        );
      });
    }
  };

  const facetExists = useMemo(() => {
    return Object.keys(nestedDropdown).length > 0 && facetKey in nestedDropdown;
  }, [nestedDropdown]);

  return (
    <DropdownContainer className="dropdown-container">
      {facetKey}
      {Object.entries(selectedValues).length === 0 ? (
        <>
          {Object.keys(facetedList).length > 0 &&
            facetKey in facetedList &&
            (facetedList[facetKey].isNested
              ? facetedList[facetKey].mappings.map((mapping, index) => {
                  // render the key and render child facet items recursively if the key is expanded (i.e., lastSelected)
                  const [key, valuesArr] = Object.entries(mapping)[0];
                  const subFacet = facetedList[facetKey].subFacet;

                  return (
                    <FacetNestingWrapper
                      key={key}
                      className="facet-nesting-wrapper"
                    >
                      <CapsuleItem
                        className="capsule-item"
                        ref={(el) => (capsuleRefsArr.current[index] = el)}
                      >
                        {lastSelection === key ? (
                          <ArrowDropDownIcon
                            onClick={() => setLastSelection(null)}
                          />
                        ) : (
                          <ArrowRightIcon
                            onClick={() => setLastSelection(key)}
                          />
                        )}
                        <ClickableSpan
                          onClick={() => handleSelectionChange([facetKey, key])}
                        >
                          {key} - ({valuesArr.length})
                          {facetExists > 0 &&
                            nestedDropdown[facetKey].includes(key) && (
                              <CloseIcon
                                sx={closeIconStyle}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectionChange([facetKey, key], false);
                                }}
                              />
                            )}
                        </ClickableSpan>
                      </CapsuleItem>
                      {lastSelection === key && (
                        <RecursiveDropdown
                          facetKey={subFacet}
                          selectedValues={valuesArr.map((value, _) => ({
                            [subFacet]: value,
                          }))}
                          facetedList={facetedList}
                          onChange={(toAdd) =>
                            toAdd &&
                            handleSelectionChange([facetKey, key], true)
                          }
                          externalSelection={externalSelection}
                        />
                      )}
                    </FacetNestingWrapper>
                  );
                })
              : facetedList[facetKey].options.map((option, index) => {
                  return (
                    <CapsuleItem
                      key={option}
                      className="capsule-item"
                      onClick={() => handleSelectionChange([facetKey, option])}
                      ref={(el) => (capsuleRefsArr.current[index] = el)}
                    >
                      {option}
                      {facetExists > 0 &&
                        nestedDropdown[facetKey].includes(key) && (
                          <CloseIcon
                            sx={closeIconStyle}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectionChange([facetKey, option], false);
                            }}
                          />
                        )}
                    </CapsuleItem>
                  );
                }))}
        </>
      ) : (
        <>
          {facetKey in facetedList &&
            (facetedList[facetKey].isNested
              ? facetedList[facetKey].mappings.map((mapping, index) => {
                  const [key, valuesArr] = Object.entries(mapping)[0];
                  const subFacet = facetedList[facetKey].subFacet;

                  if (selectedValuesArr.includes(key)) {
                    return (
                      <FacetNestingWrapper
                        className="facet-nesting-wrapper"
                        key={key}
                      >
                        <CapsuleItem
                          className="capsule-item"
                          ref={(el) => (capsuleRefsArr.current[index] = el)}
                        >
                          {lastSelection === key ? (
                            <ArrowDropDownIcon
                              onClick={() => setLastSelection(null)}
                            />
                          ) : (
                            <ArrowRightIcon
                              onClick={() => setLastSelection(key)}
                            />
                          )}
                          <ClickableSpan
                            onClick={() =>
                              handleSelectionChange([facetKey, key])
                            }
                          >
                            {key} - ({valuesArr.length})
                            {facetExists > 0 &&
                              nestedDropdown[facetKey].includes(key) && (
                                <CloseIcon
                                  sx={closeIconStyle}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectionChange(
                                      [facetKey, key],
                                      false
                                    );
                                  }}
                                />
                              )}
                          </ClickableSpan>
                        </CapsuleItem>
                        {lastSelection === key && (
                          <RecursiveDropdown
                            facetKey={subFacet}
                            selectedValues={valuesArr.map((value, _) => ({
                              [subFacet]: value,
                            }))}
                            facetedList={facetedList}
                            onChange={(toAdd) =>
                              toAdd &&
                              handleSelectionChange([facetKey, key], true)
                            }
                            externalSelection={externalSelection}
                          />
                        )}
                      </FacetNestingWrapper>
                    );
                  }
                })
              : facetedList[facetKey].options.map((option, index) => {
                  if (selectedValuesArr.includes(option)) {
                    return (
                      <CapsuleItem
                        className="capsule-item"
                        key={option}
                        onClick={() =>
                          handleSelectionChange([facetKey, option])
                        }
                        ref={(el) => (capsuleRefsArr.current[index] = el)}
                      >
                        {facetKey} - {option}
                        {facetExists > 0 &&
                          nestedDropdown[facetKey].includes(option) && (
                            <CloseIcon
                              sx={closeIconStyle}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectionChange(
                                  [facetKey, option],
                                  false
                                );
                              }}
                            />
                          )}
                      </CapsuleItem>
                    );
                  }
                }))}
        </>
      )}
    </DropdownContainer>
  );
}
