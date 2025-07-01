"use client";
import React from "react";
import styled from "styled-components";
// import mui icons
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
// import components
import PopulationTrendAreaChart from "@/components/livingPlanetIndex/populationTrend/PopulationTrendAreaChart";
// import common components
import Sidebar from "@/common-components/Sidebar";
import Searchbar from "@/common-components/Searchbar";
import RecursiveDropdown from "@/common-components/RecursiveDropdown";

const PageWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  height: 100vh;
  max-height: 100%;
  overflow: hidden;
`;

const MainContainer = styled.div`
  flex-shrink: 1;
  display: flex;
  width: 100%;
  height: 100vh;
  overflow-y: scroll;
  overflow-x: hidden;
  background: pink;

  @media (max-width: 1280px) {
    flex-shrink: 0;
  }
`;

const SearchbarHolder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: fit-content;
  padding: 16px;
  box-sizing: border-box;
`;

export default function PopulationTrendOverTime() {
  return (
    <PageWrapper className="page-wrapper">
      <Sidebar sidebarIcon={<FilterAltRoundedIcon />}>
        <SearchbarHolder>
          <Searchbar />
        </SearchbarHolder>
      </Sidebar>
      <MainContainer className="main-container"></MainContainer>
    </PageWrapper>
  );
}
