<script lang="ts">
  import { GitHubIssue } from "./types";
  export let issue: GitHubIssue;
  export let layer: number = 1;
</script>

<div class="issue">
  {#if layer > 1}
    {#each [...Array(layer).keys()] as i}
      {#if i + 1 === layer}
        <span style="margin-left: {(i + 1) * 8}px">|-</span>
      {:else}
        <span style="margin-left: {(i + 1) * 8}px">|</span>
      {/if}
    {/each}
  {/if}

  <a href="{issue.url}">
    #{issue.number} ({issue.organization} / {issue.repository}) {issue.title}({issue.createdAt})
  </a>
  {#each issue.relatedIssues as sub}
    <svelte:self issue="{sub}" layer="{layer + 1}" />
  {/each}
</div>

<style>
  .issue {
    margin: 8px 0;
  }
</style>
