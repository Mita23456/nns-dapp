<script lang="ts">
  /**
   * Transfer ICP to current principal. For test purpose only and only available on "testnet" too.
   */
  import { Modal } from "@dfinity/gix-components";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import {
    getICPs,
    getTestBalance,
    getTokens,
    getBTC,
    getIcrcTokens,
  } from "$lib/services/dev.services";
  import { Spinner, IconAccountBalance } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError } from "$lib/stores/toasts.store";
  import {
    isCkBTCUniverseStore,
    selectedIcrcTokenUniverseIdStore,
  } from "$lib/derived/selected-universe.derived";
  import { snsOnlyProjectStore } from "$lib/derived/sns/sns-selected-project.derived";
  import type { Principal } from "@dfinity/principal";
  import { ICPToken, nonNullish, type Token } from "@dfinity/utils";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { browser } from "$app/environment";
  import { getIcrcTokenTestAccountBalance } from "$lib/api/dev.api";
  import { tokensStore } from "$lib/stores/tokens.store";

  let visible = false;
  let transferring = false;

  let inputValue: number | undefined = undefined;

  let snsSelectedProjectId: Principal | undefined;
  $: snsSelectedProjectId = $snsOnlyProjectStore;

  let icrcSelectedProjectId: Principal | undefined;
  $: icrcSelectedProjectId = $selectedIcrcTokenUniverseIdStore;

  let token: Token | undefined;
  $: token = nonNullish(icrcSelectedProjectId)
    ? $tokensStore[icrcSelectedProjectId?.toText()]?.token
    : undefined;

  const onSubmit = async () => {
    if (invalidForm || inputValue === undefined) {
      toastsError({
        labelKey: "Invalid ICPs input.",
      });
      return;
    }

    transferring = true;

    try {
      // Default to transfer ICPs if the test account's balance of the selected universe is 0.
      if (nonNullish(snsSelectedProjectId) && tokenBalanceE8s > 0n) {
        await getTokens({
          tokens: inputValue,
          rootCanisterId: snsSelectedProjectId,
        });
      } else if (nonNullish(icrcSelectedProjectId) && nonNullish(token)) {
        await getIcrcTokens({
          tokens: inputValue,
          token,
          ledgerCanisterId: icrcSelectedProjectId,
        });
      } else if ($isCkBTCUniverseStore) {
        await getBTC({
          amount: inputValue,
        });
      } else {
        await getICPs(inputValue);
      }

      reset();
    } catch (err: unknown) {
      toastsError({
        labelKey: "ICPs could not be transferred.",
        err,
      });
    }

    transferring = false;
  };

  const onClose = () => reset();

  const reset = () => {
    visible = false;
    inputValue = undefined;
  };

  let invalidForm: boolean;
  $: invalidForm = inputValue === undefined || inputValue <= 0;

  // Check the balance of the test account in that universe.
  let tokenBalanceE8s = 0n;
  $: snsSelectedProjectId,
    (async () => {
      // This was executed at build time and it depends on `window` in `base64ToUInt8Array` helper inside dev.api.ts
      if (browser) {
        if (nonNullish(snsSelectedProjectId)) {
          tokenBalanceE8s = await getTestBalance(snsSelectedProjectId);
        }
        if (nonNullish(icrcSelectedProjectId)) {
          tokenBalanceE8s = await getIcrcTokenTestAccountBalance(
            icrcSelectedProjectId
          );
        }
      }
    })();

  // If the SNS test account balance is 0, don't show a button that won't work. Show the ICP token instead.
  let tokenSymbol: string;
  $: tokenSymbol =
    nonNullish(icrcSelectedProjectId) &&
    $tokensStore[icrcSelectedProjectId?.toText()]?.token &&
    tokenBalanceE8s > 0n
      ? $tokensStore[icrcSelectedProjectId?.toText()].token.symbol
      : nonNullish(snsSelectedProjectId) && tokenBalanceE8s > 0n
      ? $snsTokenSymbolSelectedStore?.symbol ?? ICPToken.symbol
      : $isCkBTCUniverseStore
      ? $i18n.ckbtc.btc
      : ICPToken.symbol;

  let buttonTestId: string;
  $: buttonTestId =
    nonNullish(snsSelectedProjectId) && tokenBalanceE8s > 0n
      ? "get-sns-button"
      : $isCkBTCUniverseStore
      ? "get-btc-button"
      : "get-icp-button";
</script>

<TestIdWrapper testId="get-tokens-component">
  {#if $authSignedInStore}
    <button
      role="menuitem"
      data-tid={buttonTestId}
      on:click|preventDefault|stopPropagation={() => (visible = true)}
      class="open"
      title={`Get ${tokenSymbol}`}
    >
      <IconAccountBalance />
      <span>{`Get ${tokenSymbol}`}</span>
    </button>
  {/if}

  <Modal {visible} role="alert" on:nnsClose={onClose}>
    <span slot="title">{`Get ${tokenSymbol}`}</span>

    <form
      id="get-icp-form"
      data-tid="get-icp-form"
      on:submit|preventDefault={onSubmit}
    >
      <span class="label">How much?</span>

      <Input
        placeholderLabelKey="core.amount"
        name="tokens"
        inputType="icp"
        bind:value={inputValue}
        disabled={transferring}
      />
    </form>

    <button
      form="get-icp-form"
      data-tid="get-icp-submit"
      type="submit"
      class="primary"
      slot="footer"
      disabled={invalidForm || transferring}
    >
      {#if transferring}
        <Spinner />
      {:else}
        Get tokens
      {/if}
    </button>
  </Modal>
</TestIdWrapper>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .open {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    @include fonts.h5;

    color: var(--menu-color);

    padding: var(--padding-2x);

    &:focus,
    &:hover {
      color: var(--menu-select-color);
    }

    span {
      margin: 0 var(--padding) 0 var(--padding-2x);
    }

    z-index: var(--z-index);

    :global(svg) {
      width: var(--padding-3x);
      min-width: var(--padding-3x);
      height: var(--padding-3x);
    }

    span {
      white-space: nowrap;
    }
  }

  form {
    display: flex;
    flex-direction: column;

    padding: var(--padding-2x) var(--padding);
  }

  button.primary {
    min-width: var(--padding-8x);
  }
</style>
