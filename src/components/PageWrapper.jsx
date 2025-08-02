import React from "react";
import Image from "next/image";
import styled from "styled-components";
import { useSelector } from "react-redux";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
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

const TaxonInfo = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
  width: 350px;
  height: 100vh;
  overflow-y: scroll;
  border-radius: 10px 0px 0px 10px;
  background: black;
  border-left: 1px solid #ffffff88;
`;

export default function PageWrapper({ children }) {
  const { focusFacet, selections } = useSelector((state) => state.aboutTaxon);

  return (
    <Wrapper className="page-wrapper">
      {/* <PageHeader className="page-header">
        <PageTitle className="page-title">Page title</PageTitle>
      </PageHeader> */}
      {children}
      {Object.keys(selections).length > 0 && (
        <TaxonInfo>
          <Image
            src={selections[Object.keys(selections)[0]].thumbnail?.src}
            alt={Object.keys(selections)[0]}
            width={selections[Object.keys(selections)[0]].thumbnail?.width}
            height={selections[Object.keys(selections)[0]].thumbnail?.height}
          />
          <div>{selections[Object.keys(selections)[0]].extract}</div>
        </TaxonInfo>
      )}
    </Wrapper>
  );
}
