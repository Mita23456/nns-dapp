<script lang="ts">
  import type { AccountsReceiveModalData } from "$lib/types/accounts.modal";
  import type { Account } from "$lib/types/account";
  import ReceiveModal from "$lib/modals/accounts/ReceiveModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import { nonNullish } from "@dfinity/utils";

  export let data: AccountsReceiveModalData;

  let universeId: UniverseCanisterId | undefined;
  let tokenSymbol: string | undefined;
  let logo: string;
  let account: Account | undefined;
  let reload: (() => Promise<void>) | undefined;
  let canSelectAccount: boolean;

  $: ({ account, reload, canSelectAccount, universeId, tokenSymbol, logo } =
    data);
</script>

{#if nonNullish(universeId) && nonNullish(tokenSymbol)}
  <ReceiveModal
    {account}
    on:nnsClose
    qrCodeLabel={replacePlaceholders($i18n.wallet.icrc_qrcode_aria_label, {
      $tokenSymbol: tokenSymbol,
    })}
    {logo}
    logoArialLabel={tokenSymbol}
    {reload}
    {universeId}
    {canSelectAccount}
  >
    <svelte:fragment slot="address-label"
      >{replacePlaceholders($i18n.wallet.token_address, {
        $tokenSymbol: tokenSymbol,
      })}</svelte:fragment
    >
  </ReceiveModal>
{/if}
