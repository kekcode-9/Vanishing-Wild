import React, { useState } from "react";
import styled from "styled-components";
// import mui icons
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const SidebarContainer = styled.div`
  position: relative;
  top: 0;
  left: 0;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 24px;
  width: 500px;
  height: 100vh;
  overflow-y: scroll;
  overflow-x: hidden;
  background: white;

  @media (max-width: 1280px) {
    display: ${({ show }) => (show === "true" ? "flex" : "none")};
    width: 460px;
  }

  @media (max-width: 640px) {
    width: 100vw;
  }
`;

const SidebarIconHolder = styled.div`
  position: absolute;
  top: 24px;
  left: 24px;
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: gray;
  border-radius: 100px;
  cursor: pointer;
  box-shadow: 10px 10px 20px 4px black;

  @media (max-width: 1280px) {
    display: flex;
  }
`;

const CloseButtonHolder = styled.div`
  display: none;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  height: fit-content;
  padding: 16px;

  @media (max-width: 1280px) {
    display: flex;
  }
`;

export default function Sidebar({ sidebarIcon, children }) {
  const [showMenu, toggleMenu] = useState(false);

  return (
    <>
      <SidebarIconHolder onClick={() => toggleMenu(true)}>
        {sidebarIcon ?? <MenuRoundedIcon />}
      </SidebarIconHolder>
      <SidebarContainer className="sidebar-container" show={`${showMenu}`}>
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
