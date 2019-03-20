import { getConfig } from '../shared/config';

import { loadJiraData } from './jira-data';
import * as dom from './dom';

getConfig().then(config => {

  if (!(window as any).GITHUB_JIRA_SCRIPT_INJECTED) {
    (window as any).GITHUB_JIRA_SCRIPT_INJECTED = true;

    console.log('Injecting Content Script');

    const CLASS_ROW_DISCOVERED = 'gh-jira-script-discovered';

    const getMatchingJira = (issueURL: URL) => {
      const pathSplit = issueURL.pathname.split('/');
      if (pathSplit.length < 3) return null;
      const owner = pathSplit[1];
      const repo = pathSplit[2];
      for (const c of config) {
        if (c.gitHubDomain === window.location.hostname) {
          if (
            (c.repos.scope === 'all') ||
            (c.repos.scope === 'owner' && c.repos.owner.toLocaleLowerCase() === owner.toLocaleLowerCase()) ||
            (c.repos.scope === 'single' && c.repos.owner.toLocaleLowerCase() === owner.toLocaleLowerCase() && c.repos.repo.toLocaleLowerCase() === repo.toLocaleLowerCase())) {
            return c.jiraBaseUrl;
          }
        }
      }
      return null;
    };

    const updateIssueRow = async (row: Element) => {
      const issueLink =
        row.querySelector('a[data-hovercard-type="issue"]') ||
        row.querySelector('a[data-hovercard-type="pull_request"]') ||
        row.querySelector('a.h4.link-gray-dark');
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
        }
        const loading = dom.createLoadingLabel();
        labels.appendChild(loading);
        const info = await loadJiraData(issueURL, jira);
        loading.remove();
        for (const i of info) {
          const label = dom.createJiraLabel(i);
          labels.appendChild(document.createTextNode(' '));
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
});
