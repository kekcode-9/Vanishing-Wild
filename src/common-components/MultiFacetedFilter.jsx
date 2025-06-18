import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
// import common components
import Checkbox from "./Checkbox";
import RecursiveDropdown from "./RecursiveDropdown";

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100dvh;
`;

const FilterContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: min(600px, 100vw);
  height: min(600px, 100dvh);
  background: #000000;
  color: #ffffff;
`;

const FacetContainer = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
  height: 90%;
  overflow: hidden;
`;

const MainFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  height: 10%;
  padding: 12px 16px;
  box-sizing: border-box;
  gap: 20px;
  border-top: 1px solid #80808059;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 35%;
  height: 100%;
  border-right: 1px solid #80808059;
  overflow: scroll;

  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */

  /* Hide scrollbar for WebKit (Chrome, Safari, Opera) */
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Facet = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 12px 16px;
  border-bottom: 1px solid #80808059;
  cursor: pointer;
  background: ${(props) => props.bg};

  &:hover {
    background: #097e11;
  }
`;

const FilterOptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 65%;
  height: 100%;
  overflow: hidden;
`;

const FilterOptionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
  width: 100%;
  height: 90%;
  overflow: scroll;
  padding: 12px 16px;

  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */

  /* Hide scrollbar for WebKit (Chrome, Safari, Opera) */
  &::-webkit-scrollbar {
    display: none;
  }
`;

const FacetFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  height: 10%;
  border-top: 1px solid #80808059;
  padding: 12px 16px;
  box-sizing: border-box;
`;

const CTAButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 112px;
  height: 32px;
  background-color: ${(props) => props.bg};
  color: #ffffff;
  cursor: pointer;
`;

/**
 * data = {
 *  [facet: String]: {
 *    facet: String,
 *    options: String[],
 *    allowMultiple: Boolean
 *  }
 * }
 *
 * facets = String[] // just the facet names
 */

/**
 * data: 
 * {
  * [facet: String]: {
  *  isNested: Boolean,
  *  facet: String, // actual column name in db
  *  subFacet: String, // if isNested === true
  *  allowMultiple: Boolean,
  *  mappings: [String]: String, // if isNested === true,
  *  options: String[], // if isNested === false
  * }
* }
 */
export default function MultiFacetedFilter({
  data = [],
  facets = [],
  onFacetApplied = () => {},
  handleFinalSelection = () => {},
  onCancel = () => {},
}) {
  const [currentFacet, setCurrentFacet] = useState();
  const [currentOptions, setCurrentOptions] = useState(); // options from current facet
  const [selectedOptions, setSelctedOptions] = useState(); // final selection during facet switch
  const [tempSelection, setTempSelection] = useState([]); // holds selections prior to facet 

  const nestedDropdown = useSelector((state) => state.nestedDropdown);
  
  useEffect(() => {
    handleFacetSwitch(facets[0]);
  }, [])

  const handleFacetSwitch = useCallback(
    (facet) => {
      console.log("facet: ", facet);
      if (!data[facet]) return;
      const { isNested, mappings, options } = data[facet];

      if (currentFacet !== facet) {
        setCurrentFacet(facet);

        if (isNested) {
          setCurrentOptions(mappings);
        } else {
          setCurrentFacet(options);
        }

        if (selectedOptions) {
          /**
           * when switching back to a facet for which you had already made some selections,
           * take those older selections into tempSelection, else set tempSelection to empty
           */
          setTempSelection(
            selectedOptions[facet] ? [...selectedOptions[facet]] : []
          );
        }
      }
    },
    [currentFacet, selectedOptions]
  );

  const handleFacetSwitch1 = useCallback(
    (facet) => {
      if (currentFacet !== facet && selectedOptions) {
        setCurrentFacet(facet);
        setCurrentOptions(data[facet]?.options);

        /**
         * when switching back to a facet for which you had already made some selections,
         * take those older selections into tempSelection, else set tempSelection to empty
         */
        setTempSelection(
          selectedOptions[facet] ? [...selectedOptions[facet]] : []
        );
      } else if (!selectedOptions) {
        setCurrentFacet(facet);
        setCurrentOptions(data[facet]?.options);
      }
    },
    [selectedOptions, currentFacet]
  );

  const handleCheckChange = useCallback(
    (selection) => {
      if (tempSelection.length) {
        if (data[currentFacet].allowMultiple) {
          /**
           * if multiple options are allowed then check if the current selection
           * exists already, delete it if it does, else add it
           */
          const newTempSelection = [...tempSelection];
          const index = tempSelection.indexOf(selection);
          index > -1
            ? newTempSelection.splice(index, 1)
            : newTempSelection.push(selection);
          setTempSelection(newTempSelection);
        } else if (selection !== setTempSelection[0]) {
          // replace last selection with new one
          setTempSelection([selection]);
        }
      } else {
        setTempSelection([selection]);
      }
    },
    [currentFacet, data, tempSelection]
  );

  const handleFilterApplication = useCallback(() => {
    if (tempSelection.length) {
      setSelctedOptions((prevSelection) => {
        return {
          ...prevSelection,
          [currentFacet]: [...tempSelection],
        };
      });
    }
  }, [tempSelection, currentFacet, selectedOptions]);

  const handleChangeInNestedOptions = useCallback(() => {
    console.log("nested selection: ", nestedDropdown);
  }, [nestedDropdown])

  return (
    <Overlay>
      {JSON.stringify(tempSelection)} - {JSON.stringify(selectedOptions)}
      <FilterContainer className="filter-container">
        <FacetContainer className="facet-container">
          <Sidebar className="sidebar">
            {facets.map((facet, _) => {
              return (
                <Facet
                  key={facet}
                  className="facet-item"
                  onClick={() => handleFacetSwitch(facet)}
                  bg={currentFacet === facet ? " #097e11" : "transparent"}
                >
                  {facet}
                </Facet>
              );
            })}
          </Sidebar>
          <FilterOptionsContainer className="filter-options-container">
            <FilterOptionsWrapper className="filter-options-wrapper">
              {JSON.stringify(nestedDropdown)}
              <div>-----------------------------</div>
              <RecursiveDropdown 
                facetKey={"Class"}
                facetedList={data}
                onChange={handleChangeInNestedOptions}
              />
            </FilterOptionsWrapper>
            <FacetFooter className="facet-footer">
              <CTAButton
                className="cta-button"
                bg=" #097e11"
                onClick={handleFilterApplication}
              >
                Apply filters
              </CTAButton>
            </FacetFooter>
          </FilterOptionsContainer>
        </FacetContainer>
        <MainFooter className="main-footer">
          <CTAButton className="cta-button" bg=" #2d302e" onClick={onCancel}>
            Cancel
          </CTAButton>
          <CTAButton
            className="cta-button"
            bg=" #097e11"
            onClick={() => {
              handleFinalSelection(selectedOptions);
              onCancel();
            }}
          >
            Apply all
          </CTAButton>
        </MainFooter>
      </FilterContainer>
    </Overlay>
  );
}
