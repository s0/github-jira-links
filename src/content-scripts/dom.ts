export function createLoadingLabel() {
  const a = document.createElement('a');
  a.innerText = 'Loading Jira...';
  a.className = 'IssueLabel d-inline-block v-align-text-top';
  a.style.backgroundColor = '#666';
  a.style.color = '#fff';

  return a;
}