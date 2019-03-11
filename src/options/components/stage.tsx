import * as React from 'react';

import * as config from '../../shared/config';
import * as permissions from '../../shared/permissions';

import {styled} from './styling';
import { string } from 'prop-types';

interface Props {
  className?: string;
}

interface State {
  config: config.LinkConfiguration[];
  grantedOrigins: Set<string>;

  // Form State
  gitHubDomain: string;
  jiraURL: string;
  gitHubScope: string;
  gitHubOwner: string;
  gitHubRepo: string;
}

export class Stage extends React.Component<Props, State> {

  public constructor(props: Props) {
    super(props);
    this.state = {
      config: [],
      grantedOrigins: new Set(),
      gitHubDomain: 'github.com',
      jiraURL: '',
      gitHubScope: 'single',
      gitHubOwner: '',
      gitHubRepo: ''
    }

    this.gitHubDomainChange = this.gitHubDomainChange.bind(this);
    this.jiraURLChange = this.jiraURLChange.bind(this);
    this.dropdownChange = this.dropdownChange.bind(this);
    this.gitHubOwnerChange = this.gitHubOwnerChange.bind(this);
    this.gitHubRepoChange = this.gitHubRepoChange.bind(this);
    this.addLink = this.addLink.bind(this);
    this.deleteLink = this.deleteLink.bind(this);
  }

  public componentDidMount() {
    config.getConfig().then(config => this.setState({config}));
    config.addListener(config => this.setState({ config }));

    const checkPermissions = () => {
      console.log('checking permissions');
      chrome.permissions.getAll(permissions => {
        const grantedOrigins = new Set<string>();
        if (permissions.origins) {
          for (const origin of permissions.origins)
            grantedOrigins.add(origin);
        }
        this.setState({ grantedOrigins });
      });
    }

    // Check permissions on startup, and when changes.
    checkPermissions();
    chrome.permissions.onAdded.addListener(checkPermissions);
    chrome.permissions.onRemoved.addListener(checkPermissions);
  }

  private gitHubDomainChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ gitHubDomain: e.target.value });
  }

  private jiraURLChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ jiraURL: e.target.value });
  }

  private dropdownChange(e: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({ gitHubScope: e.target.value});
  }

  private gitHubOwnerChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ gitHubOwner: e.target.value });
  }

  private gitHubRepoChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ gitHubRepo: e.target.value });
  }

  private addLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log('add');
    const c = this.state.config.slice();
    //TODO: validation
    c.push({
      gitHubDomain: this.state.gitHubDomain,
      jiraBaseUrl: this.state.jiraURL,
      repos: (
        this.state.gitHubScope === 'all' ?
          { scope: 'all' } :
          this.state.gitHubScope === 'owner' ? { scope: 'owner', owner: this.state.gitHubOwner } :
          { scope: 'single', owner: this.state.gitHubOwner, repo: this.state.gitHubRepo}
      )
    });
    config.setConfig(c);
    // Work out which origins we do not have but need
    const missingOrigins = permissions.missingOriginPermissions(c, this.state.grantedOrigins);
    console.log(this.state.grantedOrigins, missingOrigins);
    if (missingOrigins.length > 0) {
      chrome.permissions.request({ origins: missingOrigins });
    }
  }

  private deleteLink(key: number) {
    if (confirm("Are you sure you want to delete this link?")) {
      const c = this.state.config.slice();
      c.splice(key, 1);
      config.setConfig(c);
      const unneededOrigins = permissions.unneededOriginPermissions(c, this.state.grantedOrigins);
      console.log(this.state.grantedOrigins, unneededOrigins);
      if (unneededOrigins.length > 0) {
        chrome.permissions.remove({ origins: unneededOrigins });
      }
    }
  }

  public render() {
    return (
      <div className={this.props.className}>
        <h1>Links for GitHub &amp; Jira</h1>
        <p>Configure which GitHub repositories you would like to link with which JIRA installations below. This plugin supports both GitHub Enterprise, and GitHub.com.</p>
        <p>Every time you view lists of issues or pull requests on GitHub, the plugin will check the appropriate JIRA for each issue to see if there is a reference to it, and if so it will add a link to JIRA, including the status information.</p>
        <p>Have suggestions, feedback or want to report an issue? Please <a href='https://github.com/samlanning/github-jira-links/issues' target='_blank' rel='nofollow noopener'>open an issue on GitHub</a>.</p>
        <table className="list">
          <tbody>
            {this.state.config.map((link, key) => (
              <tr key={key} className="link">
                <td>
                  <a href={`https://${link.gitHubDomain}/`} target="_blank" rel="nofollow noopener">{link.gitHubDomain}</a>
                </td>
                <td>
                  <a href={`${link.jiraBaseUrl}/`} target="_blank" rel="nofollow noopener">{link.jiraBaseUrl}</a>
                </td>
                <td>
                  {link.repos.scope === 'all' ? (
                    'All repositories'
                  ) : link.repos.scope === 'owner' ? (
                    <span>All repositories by <a href={`https://${link.gitHubDomain}/${link.repos.owner}`} target='_blank' rel='nofollow noopener'>{link.repos.owner}</a></span>
                  ) : (
                    <a href={`https://${link.gitHubDomain}/${link.repos.owner}/${link.repos.repo}`} target='_blank' rel='nofollow noopener'>{link.repos.owner}/{link.repos.repo}</a>
                  )}
                </td>
                <td>
                  <a onClick={() => this.deleteLink(key)}>delete</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <form onSubmit={this.addLink}>
          <h2>Add a new link</h2>
          <div className="form-group">
            <label>GitHub Domain:</label>
            <input type="text" placeholder="e.g: github.com" onChange={this.gitHubDomainChange} value={this.state.gitHubDomain} />
            <label>JIRA URL:</label>
            <input type="text" placeholder="Base-URL for the JIRA installation" onChange={this.jiraURLChange} value={this.state.jiraURL} />
          </div>
          <div className="form-group">
            <label>Linked Repositories:</label>
            <select onChange={this.dropdownChange} value={this.state.gitHubScope}>
              <option value="all">All Repositories</option>
              <option value="owner">All Repositories for an Org / Author</option>
              <option value="single">Single Repository</option>
            </select>
          </div>
          <div className="form-group">
            <label>Organization / Author:</label>
            <input type="text" disabled={this.state.gitHubScope === 'all'} onChange={this.gitHubOwnerChange} value={this.state.gitHubOwner} />
            <label>Repository:</label>
            <input type="text" disabled={this.state.gitHubScope !== 'single'} onChange={this.gitHubRepoChange} value={this.state.gitHubRepo} />
          </div>
          <div className="form-group">
            <button type="submit">Add</button>
          </div>
        </form>
        <p>This extension is an open source project - <a href='https://github.com/samlanning/github-jira-links' target='_blank' rel='nofollow noopener'>Check out the source</a>. Made by <a href='https://twitter.com/samlanning' target='_blank' rel='nofollow noopener'>@samlanning</a></p>
      </div>
    );
  }
}

const StyledStage = styled(Stage)`

a {
  color: #fff;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
}

table {
  border: 1px solid #222;
  background: #060606;
  margin-top: 20px;
  width: 100%;
  border-spacing: 0;

  tr {
    td {
      padding: 10px;
      border-bottom: 1px solid #222;
      border-right: 1px solid #161616;

      &:last-child {
        border-right: none;
      }
    }

    &:last-child td {
      border-bottom: none;
    }
  }
}

form {
  border: 1px solid #222;
  background: #060606;
  padding: 10px;
  margin-top: 20px;

  h2 {
    margin: 0;
    padding: 10px;
  }

  > div.form-group {
    padding: 10px;

    > label {
      margin-right: 5px;
    }

    > input {
      margin-right: 15px;
    }
  }
}
`;

export function rootComponent() {
  return <StyledStage />;
}
