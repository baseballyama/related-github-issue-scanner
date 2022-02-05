export interface GitHubIssue {
  title: string;
  organization: string;
  repository: string;
  number: number;
  createdAt: string;
  raw: any;
  url: string;
  relatedIssues: GitHubIssue[];
}
