<p align="center">
  <a href="https://chrome.google.com/webstore/detail/links-for-github-jira/mcedjinjmcpfknajacebeokngmnlphik"><img src="img/webstore.png" /></a>
</p>

# Links for GitHub & Jira

[![Total alerts](https://img.shields.io/lgtm/alerts/g/samlanning/github-jira-links.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/samlanning/github-jira-links/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/samlanning/github-jira-links.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/samlanning/github-jira-links/context:javascript)
[![Build Status](https://dev.azure.com/samlanning/extensions/_apis/build/status/samlanning.github-jira-links?branchName=master)](https://dev.azure.com/samlanning/extensions/_build?definitionId=1)

Chrome extension that adds links to JIRA issues from GitHub issues and PRs

![](img/screenshot.png)

When you view lists of issues or pull requests on GitHub (either GitHub.com, or GitHub enterprise), the extension will use the API of the JIRA installations of your choosing to see if there are any JIRA Issues that mention each GitHub Issue or PR. It will then insert these issues, along with their current status, right into the GitHub UI alongside the labels.

* It's not necessary to install any plugins on JIRA.
* Authentication is done simply by acting as the user you are logged in as on JIRA.
* Minimal permissions required, only access to the relevant GitHub and JIRA websites.

TODO:

* Add JIRA links to single / individual issue / PR pages
* look for additional JIRA issue keys in the titles / descriptions of issues and PRs, and commit messages, and display links there too (probably download list of JIRA projects to do this)
* Add ability to edit existing entries
* Handle being logged out of JIRA gracefully, and display a warning to users on GitHub
