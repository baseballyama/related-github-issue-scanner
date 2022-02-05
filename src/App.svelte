<script lang="ts">
  import { tick } from "svelte";
  import Issue from "./Issue.svelte";
  import { GitHubIssue } from "./types";
  import { getGitHubIssue } from "./script";

  let organizationName: string = "";
  let repositoryName: string = "";
  let issueNumber: number = 0;
  let errorMessage: string = "";
  let githubIssue: GitHubIssue | null;
  let processing = false;

  async function search() {
    if (processing) return;
    errorMessage = "";
    if (!organizationName) {
      errorMessage = "Please input Organization Name.";
      return;
    }
    if (!repositoryName) {
      errorMessage = "Please input Repository Name.";
      return;
    }
    if (issueNumber <= 0) {
      errorMessage = "Please input Issue Number.";
      return;
    }
    processing = true;
    await tick();
    githubIssue = await getGitHubIssue(
      organizationName,
      repositoryName,
      issueNumber
    );
    if (!githubIssue) errorMessage = "The specified issue does not exist";
    processing = false;
  }

  function getRequest(url: string) {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false);
    xmlHttp.send(null);
    return xmlHttp.responseText;
  }
</script>

<header>
  <h1>
    <a
      href="https://github.com/baseballyama/related-github-issue-scanner"
      target="_blank"
      rel="noopener noreferrer">Related GitHub Issue Scanner</a
    >
  </h1>
  <p>Recursively search for issues / PRs linked from a given GitHub issue.</p>
  <p class="error">{errorMessage || ""}</p>
  {#if processing}
    <p style="font-weight: bold">Getting data now! Please wait...</p>
  {/if}
</header>

<main>
  <section class="form-wrapper">
    <form on:submit|preventDefault="{search}">
      <table>
        <tr>
          <th>
            <label for="org">Organization Name</label>
          </th>
          <td>
            <input id="org" type="text" bind:value="{organizationName}" />
          </td>
        </tr>
        <tr>
          <th>
            <label for="org">Repository Name</label>
          </th>
          <td>
            <input id="org" type="text" bind:value="{repositoryName}" />
          </td>
        </tr>
        <tr>
          <th>
            <label for="org">Issue Number</label>
          </th>
          <td>
            <input id="org" type="number" bind:value="{issueNumber}" />
          </td>
        </tr>
      </table>
      <button type="submit">Search</button>
    </form>
  </section>

  {#if githubIssue}
    <h2>Search Result</h2>
    <a
      href="https://github.com/baseballyama/related-github-issue-scanner"
      target="_blank"
      rel="noopener noreferrer"
      class="star"
    >
      <h3>Please give a GitHub Star for this site!</h3>
    </a>
    <div class="result">
      <Issue issue="{githubIssue}" layer="{1}" />
    </div>
  {/if}
</main>

<style>
  header,
  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }

  input {
    width: 480px;
  }

  th {
    padding: 8px 8px 8px 0;
  }
  td {
    padding: 8px 0;
  }

  .error {
    color: red;
    font-weight: bold;
  }

  .form-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .result {
    margin: 32px;
    text-align: left;
  }

  .star {
    color: #dab300;
    font-weight: bold;
  }
</style>
