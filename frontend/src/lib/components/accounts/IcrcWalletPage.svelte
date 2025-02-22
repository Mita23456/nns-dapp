<script lang="ts">
  import { Island, Spinner } from "@dfinity/gix-components";
  import Separator from "$lib/components/ui/Separator.svelte";
  import type { Writable } from "svelte/store";
  import type { WalletStore } from "$lib/types/wallet.context";
  import { debugSelectedAccountStore } from "$lib/derived/debug.derived";
  import { findAccount, hasAccounts } from "$lib/utils/accounts.utils";
  import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
  import { TokenAmountV2, isNullish, nonNullish } from "@dfinity/utils";
  import { syncAccounts as syncWalletAccounts } from "$lib/services/wallet-accounts.services";
  import { toastsError } from "$lib/stores/toasts.store";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { i18n } from "$lib/stores/i18n";
  import { goto } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import IcrcBalancesObserver from "$lib/components/accounts/IcrcBalancesObserver.svelte";
  import WalletPageHeader from "$lib/components/accounts/WalletPageHeader.svelte";
  import WalletPageHeading from "$lib/components/accounts/WalletPageHeading.svelte";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";

  export let testId: string;
  export let accountIdentifier: string | undefined | null = undefined;
  export let selectedUniverseId: UniverseCanisterId | undefined;
  export let token: IcrcTokenMetadata | undefined = undefined;
  export let selectedAccountStore: Writable<WalletStore>;
  export let reloadTransactions: () => Promise<void>;

  debugSelectedAccountStore(selectedAccountStore);

  const reloadOnlyAccountFromStore = () => setSelectedAccount();

  const goBack = (): Promise<void> => goto(AppPath.Accounts);

  // e.g. is called from "Receive" modal after user click "Done"
  export const reloadAccount = async () => {
    if (isNullish(selectedUniverseId)) {
      return;
    }

    await loadAccount(selectedUniverseId);

    // transactions?.reloadTransactions?.() returns a promise.
    // However, the UI displays skeletons while loading and the user can proceed with other operations during this time.
    // That is why we do not need to wait for the promise to resolve here.
    reloadTransactions();
  };

  export const setSelectedAccount = () => {
    selectedAccountStore.set({
      account: findAccount({
        identifier: accountIdentifier,
        accounts: nonNullish(selectedUniverseId)
          ? $icrcAccountsStore[selectedUniverseId.toText()]?.accounts ?? []
          : [],
      }),
      neurons: [],
    });
  };

  export const loadAccount = async (
    universeId: UniverseCanisterId
  ): Promise<{
    state: "loaded" | "not_found" | "unknown";
  }> => {
    setSelectedAccount();

    // We found an account in store for the provided account identifier, all data are set
    if (nonNullish($selectedAccountStore.account)) {
      return { state: "loaded" };
    }

    // Accounts are loaded in store but no account identifier is matching
    if (hasAccounts($icrcAccountsStore[universeId.toText()]?.accounts ?? [])) {
      toastsError({
        labelKey: replacePlaceholders($i18n.error.account_not_found, {
          $account_identifier: accountIdentifier ?? "",
        }),
      });

      await goBack();
      return { state: "not_found" };
    }

    return { state: "unknown" };
  };

  let loaded = false;

  const loadData = async (universeId: UniverseCanisterId | undefined) => {
    // Universe is not yet loaded
    if (isNullish(universeId)) {
      return;
    }

    // This will display a spinner each time we search and load an account
    // It will also re-create a new component for the list of transactions which per extension will trigger fetching those
    loaded = false;

    const { state } = await loadAccount(universeId);

    // The account was loaded or was not found even though accounts are already loaded in store
    if (state !== "unknown") {
      loaded = true;
      return;
    }

    // Maybe the accounts were just not loaded yet in store, so we try to load the accounts in store
    await syncWalletAccounts({ universeId });

    // And finally try to set the account again
    await loadAccount(universeId);

    loaded = true;
  };

  $: accountIdentifier, (async () => await loadData(selectedUniverseId))();
</script>

<Island {testId}>
  <main class="legacy">
    <section>
      {#if loaded && nonNullish($selectedAccountStore.account) && nonNullish(selectedUniverseId) && nonNullish(token)}
        <IcrcBalancesObserver
          universeId={selectedUniverseId}
          accounts={[$selectedAccountStore.account]}
          reload={reloadOnlyAccountFromStore}
        >
          <WalletPageHeader
            universe={$selectedUniverseStore}
            walletAddress={$selectedAccountStore.account.identifier}
          />
          <WalletPageHeading
            accountName={$selectedAccountStore.account.name ??
              $i18n.accounts.main}
            balance={TokenAmountV2.fromUlps({
              amount: $selectedAccountStore.account.balanceUlps,
              token,
            })}
          >
            <slot name="header-actions" />
          </WalletPageHeading>

          {#if $$slots["info-card"]}
            <div class="content-cell-island info-card">
              <slot name="info-card" />
            </div>
          {/if}

          <Separator spacing="none" />

          <!-- Transactions and the explanation go together. -->
          <div>
            <slot name="page-content" />
          </div>
        </IcrcBalancesObserver>
      {:else}
        <Spinner />
      {/if}
    </section>
  </main>

  <slot name="footer-actions" />
</Island>

<style lang="scss">
  section {
    display: flex;
    flex-direction: column;
    gap: var(--padding-4x);
  }

  .info-card {
    background-color: var(--island-card-background);
  }
</style>
