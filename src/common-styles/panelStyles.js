import styled from "styled-components";

export const SidePanelContainer = styled.div`
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