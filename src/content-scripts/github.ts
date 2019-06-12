import { getConfig } from '../shared/config';

import { loadJiraData, isLoggedIn, getJiraProjects } from './jira-data';
import * as dom from './dom';

getConfig().then(config => {

  if (!(window as any).GITHUB_JIRA_SCRIPT_INJECTED) {
    (window as any).GITHUB_JIRA_SCRIPT_INJECTED = true;

    console.log('Injecting Content Script');

    const CLASS_ROW_DISCOVERED = 'gh-jira-script-discovered';

    const loginPromises = new Map<string, Promise<boolean>>();
    const getJiraLoginStatus = (jiraUrl: string) => {
      let promise = loginPromises.get(jiraUrl);
      if (!promise) {
        promise = isLoggedIn(jiraUrl);
        loginPromises.set(jiraUrl, promise);
      }
      return promise;
    };

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

    const updateIssueRow = (row: Element) => {
      const issueLink =
        row.querySelector('a[data-hovercard-type="issue"]') ||
        row.querySelector('a[data-hovercard-type="pull_request"]') ||
        row.querySelector('a.h4.link-gray-dark');
      if (!issueLink) return;
      const a = (issueLink as HTMLAnchorElement);
      const href = a.href;
      if (!href) return;
      const issueURL = new URL(href);
      const jira = getMatchingJira(issueURL);
      if (jira) {
        // Search by issue URL
        (async () => {
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
          let isLoggedIn = await getJiraLoginStatus(jira);
          loading.remove();
          if (info === 'login-required') {
            isLoggedIn = false;
          } else if (info === 'unknown-error') {
            labels.appendChild(document.createTextNode(' '));
            labels.appendChild(dom.createErrorLabel('Error fetching JIRA data'));
          } else {
            for (const i of info) {
              labels.appendChild(document.createTextNode(' '));
              labels.appendChild(dom.createJiraLabel(i));
            }
          }
          if (!isLoggedIn) {
            labels.appendChild(document.createTextNode(' '));
            labels.appendChild(dom.createLoginPromptLabel(jira));
          }
        })();
        // Search issue title for issues
        (async () => {
          const projects = await getJiraProjects(jira);
          console.log(projects);
        })();
      }
    };

    const updateIssues = () => {
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
