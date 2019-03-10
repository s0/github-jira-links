export interface LinkConfiguration {
  gitHubDomain: string;
  repos: {
    scope: 'all';
  } | {
    scope: 'owner'; owner: string;
  } | {
    scope: 'single'; owner: string; repo: string;
  };
  jiraDomain: string;
}

export const CONFIG: LinkConfiguration[] = [{
  gitHubDomain: 'github.com',
  repos: { scope: 'all' },
  jiraDomain: 'jira.semmle.com'
}];
