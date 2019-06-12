export type ContentScriptMessage = {
  type: 'jira-api-call';
  url: string;
};

export type JiraApiResponse = {
  type: 'success';
  data: string;
} | {
  type: 'error';
  status: number;
};
