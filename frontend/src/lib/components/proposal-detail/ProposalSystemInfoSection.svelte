<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import { mapProposalInfo } from "$lib/utils/proposals.utils";
  import ProposalSystemInfoEntry from "./ProposalSystemInfoEntry.svelte";
  import ProposalSystemInfoProposerEntry from "./ProposalSystemInfoProposerEntry.svelte";
  import { secondsToDateTime } from "$lib/utils/date.utils";
  import { i18n } from "$lib/stores/i18n";
  import type { NeuronId } from "@dfinity/nns";
  import type { ProposalId } from "@dfinity/nns";

  export let proposalInfo: ProposalInfo;

  let id: ProposalId | undefined;
  let type: string | undefined;
  let typeDescription: string | undefined;
  let topic: string | undefined;
  let topicDescription: string | undefined;
  let statusString: string;
  let statusDescription: string | undefined;
  let rewardStatusString: string;
  let rewardStatusDescription: string | undefined;

  let created: bigint | undefined;
  let decided: bigint | undefined;
  let executed: bigint | undefined;
  let failed: bigint | undefined;

  let proposer: NeuronId | undefined;

  $: ({
    type,
    topic,
    statusString,
    rewardStatusString,
    typeDescription,
    topicDescription,
    statusDescription,
    rewardStatusDescription,
    created,
    decided,
    executed,
    failed,
    proposer,
    id,
  } = mapProposalInfo(proposalInfo));
</script>

<h1 class="content-cell-title">{$i18n.proposal_detail.headline}</h1>

<div
  class="content-cell-details"
  data-tid="proposal-system-info-details"
  data-proposal-id={id}
>
  {#if type !== undefined}
    <ProposalSystemInfoEntry
      labelKey="type_prefix"
      testId="proposal-system-info-type"
      value={type}
      description={typeDescription}
    />
  {/if}

  {#if topic !== undefined}
    <ProposalSystemInfoEntry
      labelKey="topic_prefix"
      testId="proposal-system-info-topic"
      value={topic}
      description={topicDescription}
    />
  {/if}

  <ProposalSystemInfoEntry
    labelKey="status_prefix"
    testId="proposal-system-info-status"
    value={statusString}
    description={statusDescription}
  />

  <ProposalSystemInfoEntry
    labelKey="reward_prefix"
    testId="proposal-system-info-reward"
    value={rewardStatusString}
    description={rewardStatusDescription}
  />

  {#if created !== undefined}
    <ProposalSystemInfoEntry
      labelKey="created_prefix"
      testId="proposal-system-info-created"
      value={secondsToDateTime(created)}
      description={$i18n.proposal_detail.created_description}
    />
  {/if}

  {#if decided !== undefined}
    <ProposalSystemInfoEntry
      labelKey="decided_prefix"
      testId="proposal-system-info-decided"
      value={secondsToDateTime(decided)}
      description={$i18n.proposal_detail.decided_description}
    />
  {/if}

  {#if executed !== undefined}
    <ProposalSystemInfoEntry
      labelKey="executed_prefix"
      testId="proposal-system-info-executed"
      value={secondsToDateTime(executed)}
      description={$i18n.proposal_detail.executed_description}
    />
  {/if}

  {#if failed !== undefined}
    <ProposalSystemInfoEntry
      labelKey="failed_prefix"
      testId="proposal-system-info-failed"
      value={secondsToDateTime(failed)}
      description={$i18n.proposal_detail.failed_description}
    />
  {/if}

  <ProposalSystemInfoProposerEntry {proposer} />
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  h1 {
    @include fonts.h3;
  }
</style>
