"use client";
import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
// import mui icons
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
// import components
import AreaChart from "@/components/Charts";
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
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  background: #141414;
`;

const MainContainer = styled.div`
  flex-shrink: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  // padding: 32px;
  overflow-y: scroll;
  overflow-x: hidden;

  @media (max-width: 1280px) {
    flex-shrink: 0;
  }
`;

const ChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 32px;
  width: 100%;
  height: 100%;
`;

const ChartHeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: fit-content;
`;

const ChartTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
`;

export default function PopulationTrendOverTime() {
  const nestedDropdown = useSelector((state) => state.nestedDropdown);
  const { focusFacet, isUpdating } = useSelector((state) => state.aboutTaxon);

  const [data, setData] = useState([]);

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
  const getData = async (filters = null, focus, isNormalized = false) => {
    console.log("getData called");
    const filterBy = Object.keys(filters);

    if (filterBy.length === 0 || !focus) return;

    const url = `${MAIN}`;

    console.log("final url to send: ", url);

    const params = {
      filter_by: filterBy,
      focus,
    };

    filterBy.forEach((filterKey, _) => {
      params[filterKey] = filters[filterKey]
        .map((filterVal, _) => filterVal.split(" | ")[0])
        .join(",");
    });

    accessPublicEndpoint(url, {}, params)
      .then((data) => {
        console.log("population trend chart data: ", data);
        setData(data.data);
      })
      .catch((err) => {
        console.error("Error in population trend getData: ", err);
      });
  };

  useEffect(() => {
    if (focusFacet && !isUpdating) {
      getData(nestedDropdown, focusFacet);
    }
  }, [nestedDropdown, focusFacet, isUpdating]);

  return (
    <PageWrapper className="population-trend-wrapper">
      <MainContainer className="main-container">
        <ChartContainer className="chart-container">
          <ChartHeaderWrapper>
            <ChartTitle>{CHART.TITLE}</ChartTitle>
          </ChartHeaderWrapper>
          <AreaChart
            data={data}
            xAxisLabel={CHART.X_AXIS_LABEL}
            yAxisLabel={CHART.Y_AXIS_LABEL}
          />
        </ChartContainer>
      </MainContainer>
    </PageWrapper>
  );
} // Phalcoboenus_chimango
