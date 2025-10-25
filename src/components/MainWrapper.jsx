"use client";
import React, { useEffect } from "react";
import styled from "styled-components";
import Image from "next/image";
// import logo
import logo from "@/assets/logo.svg";
// import components
import PageWrapper from "./PageWrapper";
import MultiVertebrateFilter from "./MultiVertebrateFilter";
import GBIFRanksSearch from "./GBIFRanksSearch";
// import common components
import Sidebar from "@/components/Sidebar";

const Skeleton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #141414;
`;

const Arena = styled.div`
  position: relative;
  display: flex;
  flex-direction: row-reverse;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

export default function MainWrapper({ children }) {
  return (
    <Skeleton className="skeleton">
      <MainHeader />
      <Arena className="arena">
        <PageWrapper>{children}</PageWrapper>
        <Sidebar>
          <MultiVertebrateFilter className="multi-vertebrate-filter" />
          <GBIFRanksSearch />
        </Sidebar>
      </Arena>
    </Skeleton>
  );
}

const HeaderWrapper = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 64px;
  padding: 0px 24px;
  border-bottom: 1px solid #ffffff88;
`;

const LogoDiv = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 500;
  color: #097e11;
`;

function MainHeader() {
  return (
    <HeaderWrapper className="header-wrapper">
      <LogoDiv className="logo-div">
        <Image className="logo" src={logo} alt="Logo" width={56} height={56} />
        <span>Vanishing Wild</span>
      </LogoDiv>
    </HeaderWrapper>
  );
}
