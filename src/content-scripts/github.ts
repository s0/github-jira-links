import { CONFIG } from '../shared/config';

if (!(window as any).GITHUB_JIRA_SCRIPT_INJECTED) {
  (window as any).GITHUB_JIRA_SCRIPT_INJECTED = true;

  console.log('Injecting Content Script');

  const CLASS_ROW_DISCOVERED = 'gh-jira-script-discovered';

  const matchingJira = () => {
    const currentHost = window.location.hostname;
    const pSplit = window.location.pathname;
  };

  const updateIssueRow = (row: Element) => {
    console.log(updateIssueRow, row);
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
