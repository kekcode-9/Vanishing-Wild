"use client";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
// import mui icons
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const TaxonInfoWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
  width: 400px;
  height: 100vh;
  overflow-y: scroll;
  border-radius: 10px 0px 0px 10px;
  background: black;
  border-left: 1px solid #ffffff88;
  padding: 16px;
  box-sizing: border-box;
`;

const AccordionCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  width: 100%;
  background: #1a1a1a;
  color: #ffffff;
  padding: 12px 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

const CardHeader = styled.div`
  display: flex;
  ${({ iscolumn }) => iscolumn === "true" && `
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  `}
  align-items: center;
  gap: 12px;
  // height: ${({ iscolumn }) => iscolumn === "true" ? "auto" : "72px"};
  cursor: pointer;
`;

const Thumbnail = styled(Image)`
  border-radius: 8px;
  object-fit: cover;
  aspect-ratio: 1 / 1; !important
`;

const Title = styled.div`
  flex: 1;
  font-size: 16px;
  font-weight: 600;
`;

const Arrow = styled(motion.div)`
  display: flex;
  align-items: center;
`;

/* Collapsible body animated with Framer Motion */
const CardBody = styled(motion.div)`
  overflow: hidden;
  padding: 0 16px;
  background: #262626;
`;

/* ---------- Animation variants ---------- */
const bodyVariants = {
  collapsed: { height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0 },
  expanded: { height: "auto", opacity: 1, paddingTop: 12, paddingBottom: 12 },
};

export default function TaxonInfo() {
  const { focusFacet, selections } = useSelector((state) => state.aboutTaxon);
  const [openCardId, setOpenCardId] = useState(null);

  const toggleCard = (id) => setOpenCardId((prev) => (prev === id ? null : id));

  return (
    <TaxonInfoWrapper>
      {Object.keys(selections).length > 0 &&
        Object.entries(selections).map(([taxonKey, taxonInfo], index) => {
          const isOpen = openCardId === index;

          return (
            <AccordionCard
              className="accordion-card"
              key={index}
              layout
              initial={{ borderRadius: 12 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {/* <Image
                src={selections[Object.keys(selections)[0]].thumbnail?.src}
                alt={Object.keys(selections)[0]}
                width={selections[Object.keys(selections)[0]].thumbnail?.width}
                height={
                  selections[Object.keys(selections)[0]].thumbnail?.height
                }
              />
              <div>{selections[Object.keys(selections)[0]].extract}</div> */}
              {/* ---------- Header ---------- */}
              <CardHeader onClick={() => toggleCard(index)} iscolumn={`${isOpen}`}>
                {taxonInfo.thumbnail.src && <Thumbnail
                  src={taxonInfo.thumbnail?.src}
                  alt={taxonKey}
                  width={isOpen ? taxonInfo.thumbnail?.width : 64}
                  height={isOpen ? taxonInfo.thumbnail?.height : 64}
                />}
                <Title>{taxonKey}</Title>
                <Arrow
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ExpandMoreIcon />
                </Arrow>
              </CardHeader>

              {/* ---------- Body (collapsible) ---------- */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <CardBody
                    key={taxonKey}
                    variants={bodyVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <p>{taxonInfo.extract}</p>
                  </CardBody>
                )}
              </AnimatePresence>
            </AccordionCard>
          );
        })}
    </TaxonInfoWrapper>
  );
}
