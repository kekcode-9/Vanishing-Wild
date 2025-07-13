"use client";
import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
// import mui icons
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
// import components
import LineCharts from "@/components/Charts";
// import common components
import Sidebar from "@/common-components/Sidebar";
import Searchbar from "@/common-components/Searchbar";
import RecursiveDropdown from "@/common-components/RecursiveDropdown";
import CTA from "@/common-components/CTA";
// import constants
import { API_ENDPOINTS } from "@/constants/api-constants";
import { UI_STRINGS } from "@/constants/ui-string-constants";
// import services
import { accessPublicEndpoint } from "@/services/rest.service";

const { FILTER_OPTIONS, MAIN } = API_ENDPOINTS.POPULATION_TREND_CHART;
const { APPLY } = UI_STRINGS.CTA;
const { CHART } = UI_STRINGS.LIVING_PLANET_INDEX.POPULATION_TREND;

const PageWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  height: 100vh;
  max-height: 100%;
  overflow: hidden;
  background: #141414;
`;

const MainContainer = styled.div`
  flex-shrink: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  padding: 32px;
  overflow-y: scroll;
  overflow-x: hidden;

  @media (max-width: 1280px) {
    flex-shrink: 0;
  }
`;

const ChartContainer = styled.div``;

const SearchbarHolder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: fit-content;
  padding: 16px;
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

export default function PopulationTrendOverTime() {
  const nestedDropdown = useSelector((state) => state.nestedDropdown);

  const [facetedList, setFacetedList] = useState();
  const [searchMatches, setSearchMatches] = useState({});
  const [selectionFromSearch, setSelectionFromSearch] = useState();
  const [data, setData] = useState([]);

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

  /**
   *
   * @param {*} filters = {
   *  [facet: String]: String[]
   * }
   * example: {
   *  "Common_name": ["Common_name 1", "Common_name 2"],
   *  "Country": ["country 1", "country 2", "country 3"]
   * }
   * @param {*} isNormalized
   */
  const getData = async (filters = null, isNormalized = false) => {
    console.log("getData called");
    const filterBy = Object.keys(filters);
    const focus =
      filterBy.includes("Binomial") && filters["Binomial"].length > 0
        ? "Binomial"
        : filterBy.includes("Family") && filters["Family"].length > 0
        ? "Family"
        : "Class";

    const url =
      `http://localhost:3000/api${MAIN}?` +
      `filter_by=${filterBy}&` +
      `focus=${focus}&` +
      filterBy
        .map(
          (filterKey, _) =>
            `${filterKey}=${filters[filterKey]
              .map((filterVal, _) => filterVal.split(" | ")[0])
              .join(",")}`
        )
        .join("&") +
      `&Country=all` +
      `&agg=sum`;

    console.log("final url to send: ", url);

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log("population trend chart data: ", data);
        setData(data.data);
      })
      .catch((err) => {
        console.error("Error in population trend getData: ", err);
      });
  };

  useEffect(() => {
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

  const handleFinalFacetSelection = useCallback(() => {
    getData(nestedDropdown);
  }, [nestedDropdown]);

  return (
    <PageWrapper className="page-wrapper">
      <Sidebar sidebarIcon={<FilterAltRoundedIcon />}>
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
          <CTA isStretched={true} onClick={handleFinalFacetSelection}>
            {APPLY}
          </CTA>
        </CTAContainer>
      </Sidebar>
      <MainContainer className="main-container">
        <ChartContainer>
          <LineCharts
            data={data}
            title={CHART.TITLE}
            xAxisLabel={CHART.X_AXIS_LABEL}
            yAxisLabel={CHART.Y_AXIS_LABEL}
          />
        </ChartContainer>
      </MainContainer>
    </PageWrapper>
  );
} // Phalcoboenus_chimango
