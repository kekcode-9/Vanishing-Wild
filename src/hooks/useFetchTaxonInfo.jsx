import React, { useRef } from "react";
// import constants
import { API_ENDPOINTS } from "@/constants/api-constants";
// import services
import {
  accessPublicEndpoint,
  getThirdPartyData,
} from "@/services/rest.service";

const { SUGGEST, REDLIST_CATEGORY } = API_ENDPOINTS.GBIF_SPECIES;

export default function useFetchTaxonInfo() {
  const getUsageKey = async (focus, focusMatches = []) => {
    const taxonToKeyMap = {};

    // map each match to a promise
    const promises = focusMatches.map((match) =>
      accessPublicEndpoint(SUGGEST, {}, { rank: focus, q: match })
        .then((res) => {
          const firstMatch = res[0];
          taxonToKeyMap.current[firstMatch[focus.toLowerCase()]] =
            firstMatch.key;
        })
        .catch((err) => {
          console.error("Failed to get usageKey for ", match, " : ", err);
        })
    );

    // wait until all API calls finish
    await Promise.all(promises);

    return taxonToKeyMap;
  };

  /**
   * 
   * @param {*} taxonToKeyMap = {
   *  [taxonVal: String]: Number // the value is a GBIF usageKey
   * }
   * @returns newSelection = {
   *  thumbnail: {
   *    src: String, // url
   *    width: Number,
   *    height: Number
   *  },
   *  extract: String,
   *  pageSrc: String, // url
   *  gbifUsageKey: Number, // for use by taxon-observation-density-map,
   *  redlist: String
   * }
   */
  const getTaxonInfo = async (taxonToKeyMap = null) => {
    if (taxonToKeyMap !== null) {
      const newSelections = {};

      const promises = Object.entries(taxonToKeyMap).map(([taxonVal, gbifUsageKey], _) =>
        getThirdPartyData(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${taxonVal}`
        )
          .then((wikiRes) => {
            newSelections[taxonVal] = {
              thumbnail: wikiRes.thumbnail
                ? {
                    src: wikiRes.thumbnail.source,
                    width: wikiRes.thumbnail.width,
                    height: wikiRes.thumbnail.height,
                  }
                : null,
              extract: wikiRes.extract,
              pageSrc: wikiRes.content_urls?.desktop.page,
              gbifUsageKey,
            };
            console.log("wiki info received: ", newSelections)

            const endpoint = `${REDLIST_CATEGORY}/${gbifUsageKey}`;

            accessPublicEndpoint(endpoint, {}, {}, "GET")
              .then((redlistRes) => {
                newSelections[taxonVal] = {
                    ...newSelections[taxonVal],
                    redlist: `${redlistRes.code} - ${redlistRes.category}`
                }
              })
              .catch((err) => {
                console.error(
                  "Failed to get redlist category for ",
                  taxonVal,
                  " : ",
                  err
                );
              });
          })
          .catch((err) => {
            console.error("Failed to get wiki info for ", taxonVal, " : ", err);
          })
      );

      await Promise.all(promises);

      return newSelections;
    }
  };

  return { getUsageKey, getTaxonInfo };
}
