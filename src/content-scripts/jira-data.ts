export interface JiraLink {
  name: string;
  url: string;
}

interface JiraSearchResponse {
  issues: {
    fields: {
      status: {
        name: string;
        statusCategory: {
          colorName: string;
        }
      }
    };
    key: string;
  }[];
}

export async function loadJiraData(issueUrl: URL, jiraUrl: string): Promise<JiraLink[]> {
  console.log('loadJiraData', issueUrl, jiraUrl);
  // TODO
  const url = `${jiraUrl}/rest/api/2/search?jql=text%20~%20"${encodeURIComponent(issueUrl.href)}"`;
  console.log(url);
  const response = await fetch(url);
  const body = await response.text();
  const json = JSON.parse(body) as JiraSearchResponse;
  const result: JiraLink[] = [];
  for(const issue of json.issues) {
    result.push({
      name: issue.key,
      url: `${jiraUrl}/browse/${issue.key}`
    });
  }
  return result;
}
