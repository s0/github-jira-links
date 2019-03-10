import { JiraLink, StatusColors } from './jira-data';

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

  const status = document.createElement('span');
  a.appendChild(status);
  status.innerText = jira.status;
  status.style.marginLeft = '5px';
  status.style.background = StatusColors[jira.statusColor].bg;
  status.style.color = StatusColors[jira.statusColor].text;
  status.style.padding = '1px 4px';
  status.style.borderRadius = '3px';
  status.style.fontSize = '11px';
  status.style.border = '1px solid rgba(255, 255, 255, 0.4)';

  return a;
}