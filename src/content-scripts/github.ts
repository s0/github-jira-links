import { CONFIG } from '../shared/config';

import { loadJiraData } from './jira-data';
import * as dom from './dom';

if (!(window as any).GITHUB_JIRA_SCRIPT_INJECTED) {
  (window as any).GITHUB_JIRA_SCRIPT_INJECTED = true;

  console.log('Injecting Content Script');

  const CLASS_ROW_DISCOVERED = 'gh-jira-script-discovered';

  const getMatchingJira = (issueURL: URL) => {
    const pathSplit = issueURL.pathname.split('/');
    if (pathSplit.length < 3) return null;
    const owner = pathSplit[1];
    const repo = pathSplit[2];
    for (const config of CONFIG) {
      if (config.gitHubDomain === window.location.hostname) {
        if (
          (config.repos.scope === 'all') ||
          (config.repos.scope === 'owner' && config.repos.owner === owner) ||
          (config.repos.scope === 'single' && config.repos.owner === owner && config.repos.repo === repo)) {
          return config.jiraBaseUrl;
        }
      }
    }
    return null;
  };

  const updateIssueRow = async (row: Element) => {
    const issueLink = row.querySelector('a[data-hovercard-type="issue"]') || row.querySelector('a[data-hovercard-type="pull_request"]');
    if (!issueLink) return;
    const href = (issueLink as HTMLAnchorElement).href;
    if (!href) return;
    const issueURL = new URL(href);
    const jira = getMatchingJira(issueURL);
    if (jira) {
      let labels = row.querySelector('.labels');
      if (!labels) {
        labels = document.createElement('span');
        labels.className = 'labels lh-default';
        const parent = issueLink.parentNode;
        if (!(parent instanceof Element)) return;
        parent.insertBefore(labels, parent.querySelector('.text-small'));
      };
      const loading = dom.createLoadingLabel();
      labels.appendChild(loading);
      const info = await loadJiraData(issueURL, jira);
      loading.remove();
      for (const i of info) {
        const label = dom.createJiraLabel(i);
        labels.appendChild(label);
      }
    }
  };

  const updateIssues = () => {

    // Check if we are in a repo that we care about

    for (const elem of document.querySelectorAll('.js-issue-row')) {
      if (elem.classList.contains(CLASS_ROW_DISCOVERED)) continue;
      elem.classList.add(CLASS_ROW_DISCOVERED);
      updateIssueRow(elem);
    }
  };

  const observer = new MutationObserver(mutations => {
    updateIssues();
  });
  observer.observe(document, { attributes: true, childList: true, subtree: true });
  updateIssues();


}
