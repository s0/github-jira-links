if (!(window as any).GITHUB_JIRA_SCRIPT_INJECTED) {
  (window as any).GITHUB_JIRA_SCRIPT_INJECTED = true;

  console.log('Injecting Content Script');

  interface LinkConfiguration {
    gitHubDomain: string;
    owner: string;
  }


}
