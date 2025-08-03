import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
// import mui icons
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
// import common components
import Sidebar from "@/common-components/Sidebar";
import Searchbar from "@/common-components/Searchbar";
import RecursiveDropdown from "@/common-components/RecursiveDropdown";
import CTA from "@/common-components/CTA";
// import constants
import { API_ENDPOINTS } from "@/constants/api-constants";
import { UI_STRINGS } from "@/constants/ui-string-constants";
// import services
import {
  accessPublicEndpoint,
  getThirdPartyData,
} from "@/services/rest.service";
// import reducers
import {
  updateFocus,
  updateSelections,
} from "@/lib/store/features/about-selected-taxon/aboutTaxonSlice";

const { FILTER_OPTIONS } = API_ENDPOINTS;
const { APPLY } = UI_STRINGS.CTA;

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 24px;
  width: 400px;
  height: calc(100vh - 64px); // 100%;
  overflow-y: hidden;
  overflow-x: hidden;
  background: black;
  border-right: 1px solid #ffffff87;
  padding: 16px;
  box-sizing: border-box;

  @media (max-width: 640px) {
    width: 100vw;
  }
`;

const FilterIconHolder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #097e11;
  border-radius: 100px;
  cursor: pointer;
  box-shadow: 10px 10px 20px 4px black;
`;

const CloseButtonHolder = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  height: fit-content;
  padding: 0px 16px;
`;

const SearchbarHolder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: fit-content;
  padding: 0px 16px;
  box-sizing: border-box;
`;

const DropdownWrapper = styled.div`
  flex-grow: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
`;

const CTAContainer = styled.div`
  width: 100%;
  height: fit-content;
  padding: 0px 12px;
`;

const DEFAULT_FACET_KEY = "Class";

export default function TaxonomyFilter() {
  const nestedDropdown = useSelector((state) => state.nestedDropdown);
  const dispatch = useDispatch();

  const [showFilterOptions, toggleFilterOptions] = useState(false);
  const [facetedList, setFacetedList] = useState();
  const [searchMatches, setSearchMatches] = useState({});
  const [selectionFromSearch, setSelectionFromSearch] = useState();

  const getFacetedFilter = (isNormalized = false) => {
    accessPublicEndpoint(FILTER_OPTIONS)
      .then((data) => {
        console.log("response at ", FILTER_OPTIONS, ": ", data.facetedList);
        setFacetedList(data.facetedList);
      })
      .catch((err) => {
        console.error("error at ", FILTER_OPTIONS, ": ", err);
      });
  };

  useEffect(() => {
    console.log("TaxonomyFilter entered");
    getFacetedFilter();
  }, []);

  const handleSearchQueryChange = async (query) => {
    accessPublicEndpoint(FILTER_OPTIONS, {}, { queryString: query })
      .then((res) => {
        console.log("search matches over api: ", res.matchedFacetedList);
        setSearchMatches(res.matchedFacetedList);
      })
      .catch((err) => {
        console.log("fai");
      });
  };

  const handleSearchMatchSelection = (facetName, matchArr) => {
    console.log("matchedArr: ", [
      facetName + "-" + matchArr[0],
      ...matchArr.slice(0),
    ]);
    setSelectionFromSearch([
      facetName + "-" + matchArr[0],
      ...matchArr.slice(0),
    ]);
  };

  const handleFilterApplication = useCallback(() => {
    console.log("handleFilterApplication called");
    const filterBy = Object.keys(nestedDropdown);
    // compare by common name here
    const focus =
      filterBy.includes("Binomial") && nestedDropdown["Binomial"].length > 0
        ? "Binomial"
        : filterBy.includes("Family") && nestedDropdown["Family"].length > 0
        ? "Family"
        : "Class";

    if (filterBy.length === 0 || !focus) return;

    const focusMatches = nestedDropdown[focus];

    let count = 0;
    dispatch(updateFocus(focus));

    focusMatches.forEach((match, _) => {
      // use origin=* when using api.php
      getThirdPartyData(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${match}`
      )
        .then((res) => {
          dispatch(
            updateSelections({
              [match]: {
                thumbnail: res.thumbnail ? {
                  src: res.thumbnail.source,
                  width: res.thumbnail.width,
                  height: res.thumbnail.height,
                } : null,
                extract: res.extract,
                pageSrc: res.content_urls?.desktop.page,
              },
            })
          );

          count++;

          if (count === focusMatches.length) {
            toggleFilterOptions(false);
          }
        })
        .catch((err) => {
          console.error("failed to fetch from wikipedia: ", err);
        });
    });
  }, [nestedDropdown]);

  return (
    <>
      {!showFilterOptions ? (
        <FilterIconHolder onClick={() => toggleFilterOptions(true)}>
          <FilterListIcon />
        </FilterIconHolder>
      ) : (
        <Container className="taxonomy-filter">
          <CloseButtonHolder>
            <CloseIcon
              onClick={() => toggleFilterOptions(false)}
              sx={{ cursor: "pointer", color: "gray" }}
            />
          </CloseButtonHolder>
          <SearchbarHolder>
            <Searchbar
              onQueryChange={handleSearchQueryChange}
              searchMatches={searchMatches}
              onSelect={handleSearchMatchSelection}
            />
          </SearchbarHolder>
          <DropdownWrapper>
            <RecursiveDropdown
              facetKey={DEFAULT_FACET_KEY}
              facetedList={facetedList}
              externalSelection={selectionFromSearch}
            />
          </DropdownWrapper>
          <CTAContainer>
            <CTA isStretched={true} onClick={handleFilterApplication}>
              {APPLY}
            </CTA>
          </CTAContainer>
        </Container>
      )}
    </>
  );
}
