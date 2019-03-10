export interface LinkConfiguration {
  gitHubDomain: string;
  repos: {
    scope: 'all'
  } | {
    scope: 'owner'; owner: string
  } | {
    scope: 'single'; owner: string; repo: string;
  }
  jiraDomain: string;
}
