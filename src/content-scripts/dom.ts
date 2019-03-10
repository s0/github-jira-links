import { JiraLink } from './jira-data';

export function createLoadingLabel() {
  const a = document.createElement('a');
  a.innerText = 'Loading Jira...';
  a.className = 'IssueLabel d-inline-block v-align-text-top';
  a.style.backgroundColor = '#666';
  a.style.color = '#fff';

  return a;
}

export function createJiraLabel(jira: JiraLink) {
  const a = document.createElement('a');
  a.innerText = jira.name;
  a.className = 'IssueLabel d-inline-block v-align-text-top';
  a.style.backgroundColor = '#666';
  a.style.color = '#fff';
  a.href = jira.url;
  a.target = '_blank';
  a.rel = 'nofollow noopener';

  return a;
}