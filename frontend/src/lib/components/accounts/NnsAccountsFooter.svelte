<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
  import { i18n } from "$lib/stores/i18n";
  import Footer from "$lib/components/layout/Footer.svelte";
  import { nonNullish } from "@dfinity/utils";
  import ReceiveButton from "$lib/components/accounts/ReceiveButton.svelte";
  import { syncAccounts } from "$lib/services/icp-accounts.services";
  import { openAccountsModal } from "$lib/utils/modals.utils";
  import { IconAdd } from "@dfinity/gix-components";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import IC_LOGO from "$lib/assets/icp.svg";

  // TODO: for performance reason use `loadBalance` to reload specific account
  const reload = async () => await syncAccounts();

  const openBuyIcpModal = () => {
    openAccountsModal({
      type: "buy-icp",
      data: {
        account: $icpAccountsStore.main,
        reload,
        canSelectAccount: false,
      },
    });
  };

  const openSendNnsModal = () => {
    openAccountsModal({
      type: "nns-send",
      data: {
        reload: undefined,
      },
    });
  };
</script>

<TestIdWrapper testId="nns-accounts-footer-component">
  {#if nonNullish($icpAccountsStore)}
    <Footer columns={3}>
      <button
        class="secondary full-width"
        on:click={openSendNnsModal}
        data-tid="open-new-transaction">{$i18n.accounts.send}</button
      >

      <ReceiveButton
        type="nns-receive"
        canSelectAccount
        {reload}
        universeId={OWN_CANISTER_ID}
        logo={IC_LOGO}
      />

      <button
        class="primary full-width with-icon"
        on:click={openBuyIcpModal}
        data-tid="buy-icp-button"
      >
        <IconAdd />{$i18n.accounts.buy_icp}
      </button>
    </Footer>
  {/if}
</TestIdWrapper>

<style lang="scss">
  @use "../../themes/mixins/button";
  button {
    @include button.with-icon;
  }
</style>
