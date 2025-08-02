"use client";
import React from "react";
import styled from "styled-components";
// import components
import PageWrapper from "./PageWrapper";
import TaxonomyFilter from "./TaxonomyFilter";
// import common components
import Sidebar from "@/common-components/Sidebar";

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
      <MainHeader></MainHeader>
      <Arena className="arena">
        <PageWrapper>
            {children}
        </PageWrapper>
        <Sidebar>
            <TaxonomyFilter className="taxonomy-filter" />
        </Sidebar>
      </Arena>
    </Skeleton>
  );
}

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 64px;
  padding: 0px 24px;
  border-bottom: 1px solid #ffffff88;
`;

function MainHeader() {
  return <HeaderWrapper className="header-wrapper"></HeaderWrapper>;
}
