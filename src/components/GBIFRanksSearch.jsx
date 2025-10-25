import React, { useCallback, useRef, useState } from "react";
import { useDispatch } from "react-redux";
// import mui icons
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
// import mui components
import { Tooltip } from "@mui/material";
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
// import libs
import { capitalizeFirstLetter } from "@/lib/strUtils";
// import services
import { accessPublicEndpoint } from "@/services/rest.service";
// import hooks
import useFetchTaxonInfo from "@/hooks/useFetchTaxonInfo";
// import reducers
import {
  resetTaxonInfo,
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
  const dispatch = useDispatch();
  const { getTaxonInfo } = useFetchTaxonInfo();

  const [showFilterOptions, toggleFilterOptions] = useState(false);
  const [selectedRank, setSelectedRank] = useState("CLASS");
  // {matchKey: string, /* lowercase facet/rank name */, matchedObjs: gbif species search result[]}
  const [searchMatches, setSearchMatches] = useState({});

  /* an object from the list of matched objects returned by /gbif-species/suggest result */
  const selectedMatchObj = useRef(null);

  /**
   * Methods for handling user search begin
   */

  /**
   * query - string // whatever the user entered in the input box.
   * uses the string to query /gbif-species/search endpoint and stores the
   * resulting objects into searchMatches.matchedObjs and the rank to searchMatches.matchKey
   */
  const handleSearchQueryChange = useCallback(
    (query) => {
      dispatch(toggleUpdatingStatus(true));
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

  /**
   * Called when user clicks on one of the names from the list of search matches
   * matchedObj - an object from the list returned by /gbif-species/search
   */
  const handleSearchMatchSelection = useCallback((matchedObj) => {
    selectedMatchObj.current = { ...matchedObj };
  }, []);

  /**
   * Called when user clicks on the apply button
   */
  const handleFilterApplication = useCallback(async () => {
    if (selectedMatchObj.current !== null) {
      /**
       * all vertebrates fall under kingdom: animalia, phylum: chordata, subphylum: vertebrata,
       * if either of kingdom, phylum or subphylum are the selectedRank and they contain any
       * non-vertebrate group value then don't search lpi data
       */
      const matchedObj = selectedMatchObj.current;
      const selectedRankLower = matchedObj.rank.toLowerCase();
      const rankVal = matchedObj[selectedRankLower].replaceAll(" ", "_");
      const key = matchedObj.key;
      console.log("key is: ", key);
      const possiblyVertebrate =
        matchedObj.kingdom === "Animalia" && matchedObj.phylum === "Chordata";
      const taxonInfo = await getTaxonInfo({
        [rankVal]: key,
      });
      console.log("taxonInfo: ", taxonInfo);

      dispatch(resetTaxonInfo());
      dispatch(updateFocus(capitalizeFirstLetter(selectedRankLower)));
      dispatch(
        updateSelections({
          [rankVal]: {
            ...taxonInfo,
          },
        })
      );
      dispatch(resetNestedDropdown());
      possiblyVertebrate &&
        dispatch(
          updateFacet({
            facet: capitalizeFirstLetter(selectedRankLower),
            valuesArr: [rankVal],
          })
        );

      // testing only logs begin
      console.log("**********GBIFRankSearch testing logs begin**********");
      const selections = {
        [rankVal]: {
          ...taxonInfo,
        },
      };
      const nested = {
        [capitalizeFirstLetter(selectedRankLower)]: [rankVal],
      };
      console.log(
        "aboutTaxonSlice | focusFacet: ",
        capitalizeFirstLetter(selectedRankLower)
      );
      console.log("aboutTaxonSlice | selections: ", selections);
      console.log("nestedDropdownStateSlice: ", nested);
      console.log("**********GBIFRankSearch testing logs end**********");
      // testing only logs end

      // make sure for binomial / species the facet name is the same everywhere (binomial) and has the same naming convention (<genus>_<species>)
      // gbif response's species key contains the binomial but in the format ("<genus> <species>")

      // create page component from taxon-observation-density-map and use nestedDropdown and use the usageKey
      // in aboutTaxonSlice --> selections to get the observation density map from gbif
    }
  }, []);
  /**
   * methods for handling user search end
   */

  return (
    <>
      {!showFilterOptions ? (
        <Tooltip title="Search by GBIF Taxonomic Ranks" placement="right">
          <IconHolderRound onClick={() => toggleFilterOptions(true)}>
            <SearchIcon />
          </IconHolderRound>
        </Tooltip>
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
