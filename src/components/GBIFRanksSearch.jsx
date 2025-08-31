import React, { useCallback, useState } from "react";
// import mui icons
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
// import common styles
import { IconHolderRound } from "@/common-styles/iconStyles";
import { CloseButtonHolder } from "@/common-styles/closeButtonStyles";
import { SidePanelContainer } from "@/common-styles/panelStyles";
// import common components
import SimpleDropdown from "@/common-components/form-components/SimpleDropdown";
import Searchbar from "@/common-components/Searchbar";
import CTA from "@/common-components/CTA";
// import constants
import { API_ENDPOINTS } from "@/constants/api-constants";
import { UI_STRINGS } from "@/constants/ui-string-constants";
// import services
import { accessPublicEndpoint } from "@/services/rest.service";
// import reducers
import {
  updateFocus,
  updateSelections,
  toggleUpdatingStatus,
} from "@/lib/store/features/about-selected-taxon/aboutTaxonSlice";
import {
  resetNestedDropdown,
  updateFacet,
} from "@/lib/store/features/nested-dropdown-state/nestedDropdownStateSlice";

const { SUGGEST } = API_ENDPOINTS.GBIF_SPECIES;

const { APPLY } = UI_STRINGS.CTA;
const { RANK_OPTIONS, DROPDOWN_LABEL } = UI_STRINGS.GBIF_RANK_SEARCH;

export default function GBIFRanksSearch() {
  const [showFilterOptions, toggleFilterOptions] = useState(false);
  const [selectedRank, setSelectedRank] = useState("CLASS");
  const [searchMatches, setSearchMatches] = useState({});

  const handleSearchQueryChange = useCallback(
    (query) => {
      console.log("selectedRank: ", selectedRank);
      accessPublicEndpoint(SUGGEST, {}, { rank: selectedRank, q: query })
        .then((res) => {
          console.log("gbif rank search response: ", res);
          setSearchMatches({
            matchedObjs: [...res],
            matchKey: selectedRank.toLowerCase(),
          });
        })
        .catch((err) => {
          alert("Failed to get search results");
          console.error("Failed to get search results: ", err);
        });
    },
    [selectedRank]
  );

  const handleSearchMatchSelection = useCallback(
    (matchedObj) => {
      /**
       * all vertebrates fall under kingdom: animalia, phylum: chordata, subphylum: vertebrata,
       * if either of kingdom, phylum or subphylum are the selectedRank and they contain any
       * non-vertebrate group value then don't search lpi data
       */

      const selectedRankLower = selectedRank.toLowerCase();
    },
    [selectedRank]
  );

  const handleFilterApplication = () => {};

  return (
    <>
      {!showFilterOptions ? (
        <IconHolderRound onClick={() => toggleFilterOptions(true)}>
          <SearchIcon />
        </IconHolderRound>
      ) : (
        <SidePanelContainer>
          <CloseButtonHolder>
            <CloseIcon
              onClick={() => toggleFilterOptions(false)}
              sx={{ cursor: "pointer", color: "gray" }}
            />
          </CloseButtonHolder>
          {selectedRank}
          <SimpleDropdown
            label={DROPDOWN_LABEL}
            options={RANK_OPTIONS}
            onChange={(value) => setSelectedRank(value)}
            defaultValue="CLASS"
            inputboxwidth="full"
            borderRadius="full"
          />
          <Searchbar
            onQueryChange={handleSearchQueryChange}
            searchMatches={searchMatches}
            onSelect={handleSearchMatchSelection}
            hasFacets={false}
          />
          <CTA isStretched={true} onClick={handleFilterApplication}>
            {APPLY}
          </CTA>
        </SidePanelContainer>
      )}
    </>
  );
}
