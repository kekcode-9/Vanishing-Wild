import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import styled from "styled-components";
// import mui icons
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";

const SidebarContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: fit-content;
  height: 100%;
  padding: 20px 8px;
  border-right: 1px solid #ffffff88;
  background: #00000047;
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);

  @media (max-width: 768px) {
    border: ${({ isopen }) =>
      isopen === "true" ? "1px solid #ffffff88" : "none"};
  }
`;

const SidebarMenuWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  width: fit-content;
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
`;

const SidebarIconHolder = styled.div`
  position: absolute;
  top: 50%;
  right: -16px;
  display: none;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #ffffff88;
  border-radius: 100%;
  background: black;
  cursor: pointer;

  @media (max-width: 768px) {
    display: flex;
    transform: ${({ isopen }) =>
      isopen === "true" ? "rotate(180deg)" : "rotate(0deg)"};
  }
`;

export default function Sidebar({ children }) {
  const [showMenu, toggleMenu] = useState();

  useLayoutEffect(() => {
    console.log("window innerWidth: ", window.innerWidth);
    window.innerWidth > 768 ? toggleMenu(true) : toggleMenu(false);
  }, []);

  return (
    <SidebarContainer className="sidebar-container" isopen={`${showMenu}`}>
      {/* SidebarIconHolder contains a button for collapsing and expanding the Sidebar
      it is not is use at the moment and has display: none */}
      <SidebarIconHolder
        className="sidebar-icon-holder"
        isopen={`${showMenu}`}
        onClick={(e) => {
          e.stopPropagation();
          toggleMenu(!showMenu);
        }}
      >
        <DoubleArrowIcon />
      </SidebarIconHolder>
      <SidebarMenuWrapper className="sidebar-menu-wrapper">
        {showMenu && <>{children}</>}
      </SidebarMenuWrapper>
    </SidebarContainer>
  );
}
