/**
 * This file contains types related to the tokens page and TokensTable.
 *
 * - `UserTokenBase` is not used directly, but it is used to create the `UserTokenLoading` and `UserTokenData` types.
 * - `UserTokenLoading` is to render a loading row in the tokens table. Used when either balance or token are not present.
 * - `UserTokenData` is used to render a row in the tokens table. Used when both balance and token are present.
 * - `UserTokenAction` is a list of actions supported by the tokens page and hardcoded in the TokensTable.
 * - `UserToken` is the union of `UserTokenLoading` and `UserTokenData`.
 */
import type { UnavailableTokenAmount } from "$lib/utils/token.utils";
import type { Principal } from "@dfinity/principal";
import type { Token, TokenAmountV2 } from "@dfinity/utils";

export enum UserTokenAction {
  Send = "send",
  GoToDetail = "goToDetail",
  Receive = "receive",
}

export type UserTokenBase = {
  universeId: Principal;
  title: string;
  subtitle?: string;
  logo: string;
  actions: UserTokenAction[];
  rowHref?: string;
};

/**
 * By using two types, we can keep `token` and `fee` mandatory in `UserTokenData`.
 *
 * This makes it easy to manage opening modals and managing actions where those fields are mandatory
 * but they are not present while loading because the data is not yet there.
 *
 */
export type UserTokenLoading = UserTokenBase & {
  balance: "loading";
  actions: [];
};

export type UserTokenData = UserTokenBase & {
  balance: TokenAmountV2 | UnavailableTokenAmount;
  // Identifier of the account related to the row (only if the row represents one account, not multiple)
  accountIdentifier?: string;
  token: Token;
  // Fees are included in the metadata of ICRC tokens, but this is not a list of only ICRC tokens
  fee: TokenAmountV2;
};

export type UserToken = UserTokenLoading | UserTokenData;
