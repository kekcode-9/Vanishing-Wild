"use client";
import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import dynamic from "next/dynamic";
import Highcharts from "highcharts";
// import icons
import FilterAltIcon from "@mui/icons-material/FilterAlt";
// import common components
import Checkbox from "@/common-components/Checkbox";
import MultiFacetedFilter from "@/common-components/MultiFacetedFilter";
// import constants
import { API_ENDPOINTS, QUERY_STRINGS, RESPONSE_KEYS } from "@/constants/api-constants";

const { MAIN, FILTER_OPTIONS } = API_ENDPOINTS.POPULATION_TREND_CHART;

const HighchartsReact = dynamic(
  () => import("highcharts-react-official").then((h) => h.HighchartsReact),
  { ssr: false }
);

const PageWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100vw;
  height: auto;
  min-height: 100dvh;
  background: #141414;
`;

const ChartHeaderBar = styled.div`
  flex-shrink: 0;
  position: sticky;
  top: 0px;
  left: 0px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100vw;
  height: 96px;
  padding: 0px 48px;
  box-sizing: border-box;
  background: #000000;
`;

const ChartHeader = styled.div`
  position: relative;
  font-size: 20px;
  font-weight: 500;
  text-align: left;
`;

const ChartOptions = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  gap: 32px;
`;

const ChartMainArea = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 40px;
  width: 100%;
  height: calc(100dvh - 96px);
  min-height: fit-content;
  padding: 0px 48px;

  @media (max-width: 1000px) {
    padding: 0px 16px;
  }
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 60vh;
  font-size: 20px;

  @media (max-width: 480px) {
    height: 40vh;
  }
`;

const IconDiv = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

export default function PopulationTrendAreaChart() {
  const [data, setData] = useState([
    {
      name: "Panthera tigris",
      data: [
        { x: 1970, y: 120 },
        { x: 1971, y: 117 },
        { x: 1972, y: 110 },
        { x: 1973, y: 102 },
        { x: 1975, y: 99 },
        { x: 1976, y: 99 },
        { x: 1977, y: 99 },
      ],
    },
  ]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [facetedFilter, setFacetedFilter] = useState();

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
    const filter_by = Object.keys(filters);
    const country = filters["Country"];
    const common_name = filters["Common_name"];

    // const url =
    //   "http://localhost:3000/api" + MAIN +
    //   (filter_by ? `?${QUERY_STRINGS.FILTER_BY}=${filter_by.join(",")}` : "") +
    //   (country ? `&${QUERY_STRINGS.COUNTRY}=${country.join(",")}` : "") +
    //   (common_name ? `&${QUERY_STRINGS.COMMON_NAME}=${common_name.join(",")}` : "");

    const url = `http://localhost:3000/api${MAIN}?` +
    `filter_by=Common_name,Country&` +
    `focus=Common_name&` +
    `${QUERY_STRINGS.COMMON_NAME}=${common_name.join(",")}&` +
    `${QUERY_STRINGS.COUNTRY}=all` +
    `&agg=sum`

    fetch(url)
    .then(res => res.json())
    .then(data => {
      console.log("data: ", data);
      setData(data.data);
    })
    .catch((err) => {
      console.error("Error in population trend getData: ", err);
    })
  };

  const getFacetedFilter = async (filterBy = null, values = []) => {
    const url =
      "http://localhost:3000/api" + FILTER_OPTIONS + `/?filter_cols=Binomial,Country` +
      (filterBy ? `&${filterBy}=${values.join(",")}` : "");
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const { commonNames, countries } = data;

        if (commonNames && countries) {
          /**
           * when all countries and all Common_names are queried
           */
          setFacetedFilter({
            "Common_name": {
              facet: "Common_name",
              options: commonNames,
              allowMultiple: true,
            },
            Country: {
              facet: "Country",
              options: countries,
              allowMultiple: true,
            },
          });
        } else if (commonNames && !countries) {
          /**
           * can happen when querying Common_names for a given set of countries
           */
          setFacetedFilter({
            "Common_name": {
              facet: "Common_name",
              options: commonNames,
              allowMultiple: true,
            },
            Country: {
              ...facetedFilter[1],
            },
          });
        } else if (!commonNames && countries) {
          /**
           * can happen when querying countries for a given set of Common_names
           */
          setFacetedFilter({
            "Common_name": {
              ...facetedFilter[0],
            },
            Country: {
              facet: "Country",
              options: countries,
              allowMultiple: true,
            },
          });
        }
      })
      .catch((err) => {
        console.error("failed to fetch filters: ", err);
      });
  };

  useEffect(() => {
    getFacetedFilter();
  }, []);

  const onFacetApplied = (selection) => {};

  const handleFinalFacetSelection = (selection) => {
    getData(selection);
  };

  const options = {
    chart: {
      type: "area",
      zoomType: "x",
      pinchType: "x",
      panning: {
        enabled: true,
        type: "x",
      },
      backgroundColor: "transparent",
      animation: true,
    },
    title: {
      text: "Population Trend Over Time",
      style: {
        color: " #ffffff",
      },
    },
    xAxis: {
      tickColor: " #ffffff",
      title: {
        text: "Year",
        offset: 60,
        style: {
          color: " #ffffff",
        },
      },
      lineColor: " #ffffff",
      allowDecimals: false,
      type: "linear",
      labels: {
        style: {
          color: " #ffffff",
        },
      },
      zoomEnabled: true,
    },
    yAxis: {
      tickColor: " #ffffff",
      lineColor: " #ffffff",
      lineWidth: 1,
      tickWidth: 1,
      title: {
        text: "Population",
        offset: 60,
        style: {
          color: " #ffffff",
        },
      },
      labels: {
        style: {
          color: " #ffffff",
        },
      },
    },
    tooltip: {
      shared: true,
      valueSuffix: " individuals",
    },
    legend: {
      enabled: true,
      itemStyle: {
        color: " #ffffff",
      },
    },
    series: data,
    credits: {
      enabled: false,
    },
    plotOptions: {
      area: {
        fillOpacity: 0.3,
        marker: {
          enabled: false,
        },
      },
    },
  };

  return (
    <PageWrapper className="page-wrapper">
      <ChartHeaderBar className="chart-header-bar">
        <ChartHeader className="chart-header">
          Population trend over time
        </ChartHeader>
      </ChartHeaderBar>
      <ChartMainArea className="chart-main-area">
        <ChartOptions className="chart-options">
          <IconDiv onClick={() => setShowFilterMenu(true)}>
            <FilterAltIcon /> <span>Filters</span>
          </IconDiv>
          <Checkbox
            name="normalize"
            value="normalize"
            label="Normalize data"
            onCheckChange={() => {}}
          />
        </ChartOptions>
        <ChartContainer className="chart-container">
          <HighchartsReact highcharts={Highcharts} options={options} />
        </ChartContainer>
      </ChartMainArea>
      {showFilterMenu && (
        <MultiFacetedFilter
          data={facetedFilter}
          facets={["Common_name", "Country"]}
          handleFinalSelection={handleFinalFacetSelection}
          onCancel={() => setShowFilterMenu(false)}
        />
      )}
    </PageWrapper>
  );
}
