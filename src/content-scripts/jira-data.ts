interface JiraLink {
  name: string;
  url: string;
}

export async function loadJiraData(issueUrl: URL, jiraUrl: string): Promise<JiraLink[]> {
  console.log('loadJiraData', issueUrl, jiraUrl);
  // TODO
  await new Promise(() => {}); // wait indefinitely
  return [];
}