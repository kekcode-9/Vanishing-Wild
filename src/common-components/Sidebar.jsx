import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
// import mui icons
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const SidebarContainer = styled.div`
  position: relative;
  top: 0;
  left: 0;
  z-index: 1000;
  flex-shrink: 0;
  display: ${({ show }) => (show === "true" ? "flex" : "none")};
  width: 460px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 24px;
  width: 400px;
  height: 100vh;
  overflow-y: hidden;
  overflow-x: hidden;
  background: black;
  border-right: 1px solid #ffffff87;
  padding: 16px;

  @media (max-width: 640px) {
    width: 100vw;
  }
`;

const SidebarIconHolder = styled.div`
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: gray;
  border-radius: 100px;
  cursor: pointer;
  box-shadow: 10px 10px 20px 4px black;
`;

const CloseButtonHolder = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  height: fit-content;
  padding: 0px 16px;
`;

export default function Sidebar({ sidebarIcon, collapse = false, children }) {
  const [showMenu, toggleMenu] = useState(false);

  const iconRef = useRef();
  const containerRef = useRef();

  const handleSidebarCollapse = (e) => {
    if (
      (iconRef.current && iconRef.current.contains(e.target)) ||
      (containerRef.current && containerRef.current.contains(e.target))
    )
      return;

    toggleMenu(false);
  };

  useEffect(() => {
    document.addEventListener("click", handleSidebarCollapse);

    return () => {
      document.removeEventListener("click", handleSidebarCollapse);
    };
  }, [showMenu]);

  useEffect(() => {
    if (collapse) toggleMenu(false);
  }, [collapse]);

  return (
    <>
      <SidebarIconHolder
        ref={iconRef}
        onClick={(e) => {
          e.stopPropagation();
          toggleMenu(true);
        }}
      >
        {sidebarIcon ?? <MenuRoundedIcon />}
      </SidebarIconHolder>
      <SidebarContainer
        ref={containerRef}
        className="sidebar-container"
        show={`${showMenu}`}
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButtonHolder>
          <CloseRoundedIcon
            onClick={() => toggleMenu(false)}
            sx={{ cursor: "pointer", color: "gray" }}
          />
        </CloseButtonHolder>
        {children}
      </SidebarContainer>
    </>
  );
}
