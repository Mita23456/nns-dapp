import CKETH_LOGO from "$lib/assets/ckETH.svg";
import CKSEPOLIAETH_LOGO from "$lib/assets/ckSepoliaETH.svg";
import {
  CKETHSEPOLIA_UNIVERSE_CANISTER_ID,
  CKETH_UNIVERSE_CANISTER_ID,
} from "$lib/constants/cketh-canister-ids.constants";
import {
  icrcCanistersStore,
  type IcrcCanisters,
} from "$lib/stores/icrc-canisters.store";
import { tokensStore, type TokensStoreData } from "$lib/stores/tokens.store";
import type { Universe } from "$lib/types/universe";
import { isNullish, nonNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

const convertIcrcCanistersToUniverse = ({
  canisters,
  tokensData,
}: {
  canisters: IcrcCanisters;
  tokensData: TokensStoreData;
}): Universe | undefined => {
  const universeId = canisters.ledgerCanisterId.toText();
  const token = tokensData[universeId];
  // TODO: Read logo from token https://dfinity.atlassian.net/browse/GIX-2140
  const logo =
    universeId === CKETH_UNIVERSE_CANISTER_ID.toText()
      ? CKETH_LOGO
      : universeId === CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText()
      ? CKSEPOLIAETH_LOGO
      : undefined;
  if (isNullish(token) || isNullish(logo)) {
    return;
  }
  return {
    canisterId: universeId,
    title: token.token.name,
    logo,
  };
};

export const icrcTokensUniversesStore: Readable<Universe[]> = derived(
  [icrcCanistersStore, tokensStore],
  ([icrcCanisters, tokensData]) =>
    Object.values(icrcCanisters)
      .map((canisters: IcrcCanisters) =>
        convertIcrcCanistersToUniverse({ canisters, tokensData })
      )
      .filter((universe): universe is Universe => nonNullish(universe))
);
