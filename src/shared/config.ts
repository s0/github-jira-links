const STORAGE_KEY = 'links';

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


export function getConfig(): Promise<LinkConfiguration[]> {
  return new Promise(resolve => {
    chrome.storage.sync.get(data => {
      if (data[STORAGE_KEY]) {
        resolve(data[STORAGE_KEY]);
      } else {
        resolve([]);
      }
    })
  })
}

export function setConfig(config: LinkConfiguration[]): Promise<void> {
  return new Promise(resolve => {
    chrome.storage.sync.set({ [STORAGE_KEY]: config }, resolve);
  })
}

export function addListener(l: (config: LinkConfiguration[]) => void) {
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes[STORAGE_KEY]) {
      l(changes[STORAGE_KEY].newValue);
    }
  });
}
