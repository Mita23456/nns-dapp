<script lang="ts">
  import { Modal, Spinner } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";
  import { Checkbox } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import type { Filter } from "$lib/types/filters";
  import { onMount } from "svelte";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { isNullish } from "@dfinity/utils";
  import type {
    SnsProposalDecisionStatus,
    SnsProposalRewardStatus,
  } from "@dfinity/sns";
  import type {
    ProposalRewardStatus,
    ProposalStatus,
    Topic,
  } from "@dfinity/nns";

  type FiltersData =
    | SnsProposalRewardStatus
    | Topic
    | ProposalRewardStatus
    | ProposalStatus
    | SnsProposalDecisionStatus;
  // `undefined` means the filters are not loaded yet.
  export let filters: Filter<FiltersData>[] | undefined;
  export let visible = true;

  let loading: boolean;
  $: loading = isNullish(filters);

  onMount(() => {
    if (isNullish(filters)) {
      startBusy({
        initiator: "load-sns-filters",
      });
    }
  });

  $: loading,
    (() => {
      if (!loading) {
        stopBusy("load-sns-accounts");
      }
    })();

  const dispatch = createEventDispatcher();
  const close = () => dispatch("nnsClose");

  const onChange = (id: string) => {
    const filter = filters?.find((f) => f.id === id);
    dispatch("nnsChange", { filter });
  };

  const filter = () => {
    dispatch("nnsConfirm");
  };

  const selectAll = () => {
    dispatch("nnsSelectAll");
  };

  const clearSelection = () => {
    dispatch("nnsClearSelection");
  };
</script>

{#if !loading}
  <Modal {visible} on:nnsClose role="alert" testId="filter-modal">
    <slot slot="title" name="title" />

    <div slot="sub-title" class="toggle-all-wrapper">
      <button
        class="text"
        data-tid="filter-modal-select-all"
        on:click={selectAll}>{$i18n.voting.check_all}</button
      >
      <button
        class="text"
        data-tid="filter-modal-clear"
        on:click={clearSelection}>{$i18n.voting.uncheck_all}</button
      >
    </div>

    {#if filters}
      <div class="filters">
        {#each filters as { id, name, checked } (id)}
          <Checkbox
            testId={`filter-modal-option-${id}`}
            inputId={id}
            {checked}
            on:nnsChange={() => onChange(id)}>{name}</Checkbox
          >
        {/each}
      </div>
    {:else}
      <Spinner />
    {/if}

    <svelte:fragment slot="footer">
      <button
        class="secondary"
        type="button"
        aria-label="select-all-filters"
        data-tid="close"
        on:click={close}
      >
        {$i18n.core.cancel}
      </button>
      <button
        class="primary"
        type="button"
        aria-label="clear-filters"
        on:click={filter}
        data-tid="apply-filters"
      >
        {$i18n.core.filter}
      </button>
    </svelte:fragment>
  </Modal>
{/if}

<style lang="scss">
  .filters {
    --checkbox-padding: var(--padding-2x) var(--padding) var(--padding-2x);
  }

  .toggle-all-wrapper {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: var(--padding);

    margin: 0 var(--padding-2x);
  }
</style>
