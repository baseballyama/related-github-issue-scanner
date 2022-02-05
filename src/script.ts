import type { GitHubIssue } from "./types";

export async function getGitHubIssue(
  organizationName: string,
  repositoryName: string,
  issueNumber: number,
  foundIssues: Set<string> = new Set()
): Promise<GitHubIssue | null> {
  const issueUrl = buildIssueUrl(organizationName, repositoryName, issueNumber);
  if (foundIssues.has(issueUrl)) return null;
  foundIssues.add(issueUrl);

  const issueJson = JSON.parse(await request("GET", issueUrl));
  if (issueJson.message === "Not Found") return null;

  const relatedIssueUrls = await getRelatedIssueUrls(issueUrl, issueJson);
  const relatedIssuesPromise = relatedIssueUrls.map((url) => {
    const d = destructIssueUrl(url);
    return getGitHubIssue(
      d.organizationName,
      d.repositoryName,
      d.issueNumber,
      foundIssues
    );
  });

  const relatedIssues = (await Promise.all(relatedIssuesPromise))
    .filter(Boolean);
  
  const issue: GitHubIssue = {
    title: issueJson.title,
    organization: organizationName,
    repository: repositoryName,
    number: issueJson.number,
    createdAt: issueJson.created_at,
    raw: issueJson,
    url: issueJson.html_url,
    relatedIssues,
  };
  return issue;
}

async function getRelatedIssueUrls(issueUrl: string, issueJson: any) {
  const relatedIssues = extractIssuesAndPrs(issueJson.body);

  const [comments, events] = await Promise.all([
    request("GET", `${issueUrl}/comments`),
    request("GET", `${issueUrl}/events`),
  ]);

  JSON.parse(comments).forEach((comment) => {
    extractIssuesAndPrs(comment.body).forEach((f) => relatedIssues.push(f));
  });
  JSON.parse(events).forEach((event) => {
    extractHtmlUrls(event).forEach((url) => {
      extractIssuesAndPrs(url).forEach((f) => relatedIssues.push(f));
    });
  });
  return relatedIssues;
}

function extractHtmlUrls(json: any): string[] {
  const res: string[] = [];
  for (var key in json) {
    if (typeof json[key] == "object") {
      if (Array.isArray(json[key])) {
        json[key].forEach(function (item) {
          res.push(...extractHtmlUrls(item));
        });
      } else {
        // 連想配列はそのまま再帰呼び出し
        res.push(...extractHtmlUrls(json[key]));
      }
    } else {
      // 配列や連想配列でなければキーの値を表示
      if (key === "html_url") res.push(json[key]);
    }
  }
  return res;
}

function buildIssueUrl(
  organizationName: string,
  repositoryName: string,
  issueNumber: number
): string {
  return `https://api.github.com/repos/${organizationName}/${repositoryName}/issues/${issueNumber}`;
}

function destructIssueUrl(issueUrl: string): {
  organizationName: string;
  repositoryName: string;
  issueNumber: number;
} {
  const splitted = issueUrl.split("/");
  return {
    organizationName: splitted[3],
    repositoryName: splitted[4],
    issueNumber: parseInt(splitted[6]),
  };
}

function extractIssuesAndPrs(text: string): string[] {
  const regex = /https:\/\/github.com\/[^\/]+\/[^\/]+\/(pull|issues)\/[\d]+/g;
  const matches = text.match(regex);
  if (matches === null) return [];
  return matches;
}

function request(method: "GET" | "POST", url: string): Promise<string> {
  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.responseText);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText,
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText,
      });
    };
    xhr.send();
  });
}
