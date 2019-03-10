export interface LinkConfiguration {
  gitHubDomain: string;
  repos: {
    scope: 'all';
  } | {
    scope: 'owner'; owner: string;
  } | {
    scope: 'single'; owner: string; repo: string;
  };
  jiraBaseUrl: string;
}

export const CONFIG: LinkConfiguration[] = [{
  gitHubDomain: 'github.com',
  repos: { scope: 'single', owner: 'Semmle', repo: 'ql' },
  jiraBaseUrl: 'https://jira.semmle.com'
}];
