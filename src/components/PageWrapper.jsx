import React from "react";
import dynamic from "next/dynamic";
import styled from "styled-components";
import { useSelector } from "react-redux";

// import TaxonInfo with ssr disabled to prevent hydration issue with motion.div
const TaxonInfo = dynamic(() => import('./TaxonInfo'), { ssr: false });

const Wrapper = styled.div`
  display: flex;
  // flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 32px;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  padding: 20px;
  box-sizing: border-box;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: fit-content;
`;

const PageTitle = styled.div`
  font-size: 24px;
  font-weight: bold;
`;

export default function PageWrapper({ children }) {
  return (
    <Wrapper className="page-wrapper">
      {/* <PageHeader className="page-header">
        <PageTitle className="page-title">Page title</PageTitle>
      </PageHeader> */}
      {children}
      <TaxonInfo />
    </Wrapper>
  );
}
