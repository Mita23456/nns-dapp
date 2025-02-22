<script lang="ts">
  import { Principal } from "@dfinity/principal";
  import type { SnsNeuron } from "@dfinity/sns";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import SnsNeuronHotkeysCard from "$lib/components/sns-neuron-detail/SnsNeuronHotkeysCard.svelte";
  import { getSnsNeuron } from "$lib/services/sns-neurons.services";
  import {
    type SelectedSnsNeuronContext,
    type SelectedSnsNeuronStore,
    SELECTED_SNS_NEURON_CONTEXT_KEY,
  } from "$lib/types/sns-neuron-detail.context";
  import { onMount, setContext } from "svelte";
  import { toastsError } from "$lib/stores/toasts.store";
  import { queuedStore } from "$lib/stores/queued-store";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { goto } from "$app/navigation";
  import { pageStore } from "$lib/derived/page.derived";
  import { neuronsPathStore } from "$lib/derived/paths.derived";
  import { AppPath } from "$lib/constants/routes.constants";
  import SnsNeuronFollowingCard from "$lib/components/sns-neuron-detail/SnsNeuronFollowingCard.svelte";
  import { Island } from "@dfinity/gix-components";
  import SnsNeuronModals from "$lib/modals/sns/neurons/SnsNeuronModals.svelte";
  import { debugSelectedSnsNeuronStore } from "$lib/derived/debug.derived";
  import type { SnsNervousSystemParameters } from "@dfinity/sns";
  import { loadSnsParameters } from "$lib/services/sns-parameters.services";
  import { snsParametersStore } from "$lib/stores/sns-parameters.store";
  import type { E8s } from "@dfinity/nns";
  import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
  import type { Token } from "@dfinity/utils";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
  import { nonNullish, isNullish } from "@dfinity/utils";
  import { IS_TESTNET } from "$lib/constants/environment.constants";
  import SnsNeuronProposalsCard from "$lib/components/neuron-detail/SnsNeuronProposalsCard.svelte";
  import SnsPermissionsCard from "$lib/components/neuron-detail/SnsPermissionsCard.svelte";
  import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
  import SnsNeuronPageHeader from "$lib/components/sns-neuron-detail/SnsNeuronPageHeader.svelte";
  import SnsNeuronVotingPowerSection from "$lib/components/sns-neuron-detail/SnsNeuronVotingPowerSection.svelte";
  import SnsNeuronMaturitySection from "$lib/components/sns-neuron-detail/SnsNeuronMaturitySection.svelte";
  import SnsNeuronAdvancedSection from "$lib/components/sns-neuron-detail/SnsNeuronAdvancedSection.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import SnsNeuronPageHeading from "$lib/components/sns-neuron-detail/SnsNeuronPageHeading.svelte";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import SnsNeuronTestnetFunctionsCard from "$lib/components/neuron-detail/SnsNeuronTestnetFunctionsCard.svelte";
  import SkeletonHeader from "$lib/components/ui/SkeletonHeader.svelte";
  import SkeletonHeading from "$lib/components/ui/SkeletonHeading.svelte";

  export let neuronId: string | null | undefined;

  const selectedSnsNeuronStore = queuedStore<SelectedSnsNeuronStore>({
    selected: undefined,
    neuron: undefined,
  });

  setContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY, {
    store: selectedSnsNeuronStore,
    reload: () => loadNeuron({ forceFetch: true }),
  });

  debugSelectedSnsNeuronStore(selectedSnsNeuronStore);

  // BEGIN: loading and navigation

  const goBack = (replaceState: boolean): Promise<void> =>
    goto($neuronsPathStore, { replaceState });

  let rootCanisterId: Principal | undefined;
  $: rootCanisterId = $selectedSnsNeuronStore.selected?.rootCanisterId;

  let parameters: SnsNervousSystemParameters | undefined;
  $: parameters =
    $snsParametersStore?.[rootCanisterId?.toText() ?? ""]?.parameters;

  let transactionFee: E8s | undefined;
  $: transactionFee = $snsSelectedTransactionFeeStore?.toE8s();

  let token: Token;
  $: token = $snsTokenSymbolSelectedStore as Token;

  let governanceCanisterId: Principal | undefined;
  $: governanceCanisterId =
    $selectedUniverseStore.summary?.governanceCanisterId;

  const loadNeuron = async (
    { forceFetch }: { forceFetch: boolean } = { forceFetch: false }
  ) => {
    const { selected } = $selectedSnsNeuronStore;
    if (selected !== undefined && $pageStore.path === AppPath.Neuron) {
      const mutableSnsNeuronStore =
        selectedSnsNeuronStore.getSingleMutationStore();
      await getSnsNeuron({
        forceFetch,
        rootCanisterId: selected.rootCanisterId,
        neuronIdHex: selected.neuronIdHex,
        onLoad: ({
          certified,
          neuron: snsNeuron,
        }: {
          certified: boolean;
          neuron: SnsNeuron;
        }) => {
          mutableSnsNeuronStore.update({
            mutation: (store) => ({
              ...store,
              neuron: snsNeuron,
            }),
            certified,
          });
        },
        onError: () => {
          toastsError({
            labelKey: "error.neuron_not_found",
          });

          // For simplicity reason we do not catch the promise here
          goBack(true);
        },
      });
    }
  };

  onMount(async () => {
    if (neuronId === undefined || neuronId === null) {
      await goBack(true);
      return;
    }

    try {
      const rootCanisterId = Principal.fromText($pageStore.universe);
      // `loadNeuron` relies on neuronId and rootCanisterId to be set in the store
      selectedSnsNeuronStore.getSingleMutationStore().set({
        data: {
          selected: {
            neuronIdHex: neuronId,
            rootCanisterId,
          },
          neuron: null,
        },
        certified: true,
      });

      await Promise.all([
        loadNeuron(),
        loadSnsParameters(rootCanisterId),
        syncSnsAccounts({ rootCanisterId }),
      ]);
    } catch (err: unknown) {
      // $pageStore.universe might be an invalid principal, like empty or yolo
      await goBack(true);
    }
  });

  // END: loading and navigation

  let loading: boolean;
  $: loading =
    isNullish($selectedSnsNeuronStore.neuron) ||
    isNullish(parameters) ||
    isNullish(transactionFee);
</script>

<TestIdWrapper testId="sns-neuron-detail-component">
  <Island>
    <main class="legacy">
      <section data-tid="sns-neuron-detail-page">
        {#if loading}
          <SkeletonHeader />
          <SkeletonHeading />
          <Separator spacing="none" />
          <SkeletonCard noMargin cardType="info" separator />
          <SkeletonCard noMargin cardType="info" separator />
          <SkeletonCard noMargin cardType="info" separator />
          <!-- `loading` already checks for all that but TS is not smart enough to understand it -->
        {:else if nonNullish(parameters) && nonNullish(token) && nonNullish($selectedSnsNeuronStore.neuron) && nonNullish(transactionFee)}
          <SnsNeuronPageHeader {token} />
          <SnsNeuronPageHeading
            {parameters}
            neuron={$selectedSnsNeuronStore.neuron}
          />
          <Separator spacing="none" />
          <SnsNeuronVotingPowerSection
            neuron={$selectedSnsNeuronStore.neuron}
            {parameters}
            {token}
          />
          <Separator spacing="none" />
          <SnsNeuronMaturitySection
            neuron={$selectedSnsNeuronStore.neuron}
            feeE8s={transactionFee}
          />
          <Separator spacing="none" />
          <SnsNeuronAdvancedSection
            neuron={$selectedSnsNeuronStore.neuron}
            {governanceCanisterId}
            {parameters}
            {token}
            {transactionFee}
          />
          <Separator spacing="none" />
          <SnsNeuronFollowingCard />
          <Separator spacing="none" />
          <SnsNeuronHotkeysCard {parameters} />
          {#if IS_TESTNET}
            <Separator spacing="none" />
            <SnsNeuronProposalsCard />
            <Separator spacing="none" />
            <SnsNeuronTestnetFunctionsCard />
            <Separator spacing="none" />
            <SnsPermissionsCard />
          {/if}
        {/if}
      </section>
    </main>
  </Island>

  <SnsNeuronModals />
</TestIdWrapper>

<style lang="scss">
  section {
    display: flex;
    flex-direction: column;
    gap: var(--padding-4x);
  }
</style>
