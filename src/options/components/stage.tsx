import * as React from 'react';

import * as config from '../../shared/config';
import * as permissions from '../../shared/permissions';
import { EXTENSION_NAME } from '../../shared/consts';

import { ThemeProvider, defaultTheme, styled } from './styling';

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
  invalidState: Validation | null;
}

function l10nJoinItems(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return items.slice(0, items.length - 1).join(', ') + ' and ' + items[items.length-1];
}

interface Validation {
  gitHubDomainInvalid: boolean;
  jiraURLInvalid: boolean;
  gitHubOwnerInvalid: boolean;
  gitHubRepoInvalid: boolean;
}

/** Very primitive sanity check on repo and owner names */
const REPO_OWNER_MATCH = /^[a-z0-9_-]+$/;

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
      gitHubRepo: '',
      invalidState: null
    }

    this.gitHubDomainChange = this.gitHubDomainChange.bind(this);
    this.jiraURLChange = this.jiraURLChange.bind(this);
    this.dropdownChange = this.dropdownChange.bind(this);
    this.gitHubOwnerChange = this.gitHubOwnerChange.bind(this);
    this.gitHubRepoChange = this.gitHubRepoChange.bind(this);
    this.addLink = this.addLink.bind(this);
    this.deleteLink = this.deleteLink.bind(this);
    this.fixBrokenPermissions = this.fixBrokenPermissions.bind(this);
  }

  public componentDidMount() {
    config.getConfig().then(config => {
      console.log(config);
      this.setState({config});
    });
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

  private validateGitHubDomain() {
    try {
      const u = new URL(`https://${this.state.gitHubDomain}`);
      if (u.hostname === this.state.gitHubDomain)
        return this.state.gitHubDomain;
    } catch {}
    return null;
  }

  private validateJIRAURL() {
    try {
      new URL(this.state.jiraURL);
      return this.state.jiraURL;
    } catch {}
    try {
      const adjusted = 'https://' + this.state.jiraURL;
      new URL(adjusted);
      return adjusted;
    } catch { }
    return null;
  }

  private validateRepos():
      { state: 'valid'; repos: config.LinkConfigurationRepos } |
      { state: 'invalid'; invalid: { owner?: boolean; repo?: boolean; }}
  {
    if (this.state.gitHubScope === 'all') {
      return { state: 'valid', repos: { scope: 'all' } };
    }
    const ownerValid = !!REPO_OWNER_MATCH.exec(this.state.gitHubOwner);
    if (this.state.gitHubScope === 'owner') {
      if (ownerValid) {
        return { state: 'valid', repos: { scope: 'owner', owner: this.state.gitHubOwner }};
      } else {
        return { state: 'invalid', invalid: { owner: true }};
      }
    }
    const repoValid = !!REPO_OWNER_MATCH.exec(this.state.gitHubRepo);
    if (repoValid && ownerValid) {
      return { state: 'valid', repos: { scope: 'single', owner: this.state.gitHubOwner, repo: this.state.gitHubRepo } };
    } else {
      return { state: 'invalid', invalid: { owner: !ownerValid, repo: !repoValid } };
    }
  }

  private addLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log('add');
    const c = this.state.config.slice();

    // Validate Form
    const gitHubDomain = this.validateGitHubDomain();
    const jiraBaseUrl = this.validateJIRAURL();
    const repos = this.validateRepos();

    if (gitHubDomain && jiraBaseUrl && repos.state === 'valid') {
      c.push({
        gitHubDomain,
        jiraBaseUrl,
        repos: repos.repos
      });
      config.setConfig(c);
      this.addMissingPermissions(c);
      this.setState({invalidState: null});
    } else {
      const invalidState: Validation = {
        gitHubDomainInvalid: !gitHubDomain,
        jiraURLInvalid: !jiraBaseUrl,
        gitHubOwnerInvalid: repos.state === 'invalid' && !!repos.invalid.owner,
        gitHubRepoInvalid: repos.state === 'invalid' && !!repos.invalid.repo
      };
      this.setState({ invalidState });
    }
  }

  private deleteLink(key: number) {
    if (confirm("Are you sure you want to delete this link?")) {
      const c = this.state.config.slice();
      c.splice(key, 1);
      config.setConfig(c);
      const unneededOrigins = permissions.unneededOriginPermissions(c, this.state.grantedOrigins);
      if (unneededOrigins.length > 0) {
        chrome.permissions.remove({ origins: unneededOrigins });
      }
    }
  }

  private addMissingPermissions(config: config.LinkConfiguration[]) {
    const missingOrigins = permissions.missingOriginPermissions(config, this.state.grantedOrigins);
    if (missingOrigins.length > 0) {
      chrome.permissions.request({ origins: missingOrigins });
    }
  }

  private fixBrokenPermissions() {
    this.addMissingPermissions(this.state.config);
  }

  public render() {
    const missingDomains = permissions
      .missingOriginPermissions(this.state.config, this.state.grantedOrigins)
      .map(origin => {
        try {
          return new URL(origin).hostname;
        } catch {
          return origin;
        }
      });
    return (
      <div className={this.props.className}>
        {missingDomains.length > 0 ? (
          <div className='error-message'>
            This extension requires permission to access {l10nJoinItems(missingDomains)} to function properly with your current configuration.
            <button onClick={this.fixBrokenPermissions}>Grant Permission</button>
          </div>
        ) : null}
        <h1>{EXTENSION_NAME}</h1>
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
            <input
              className={this.state.invalidState && this.state.invalidState.gitHubDomainInvalid ? 'invalid' : ''}
              type="text"
              placeholder="e.g: github.com"
              onChange={this.gitHubDomainChange}
              value={this.state.gitHubDomain} />
            <label>JIRA URL:</label>
            <input
              className={this.state.invalidState && this.state.invalidState.jiraURLInvalid ? 'invalid' : ''}
              type="text"
              placeholder="e.g: jira.mycompany.com"
              onChange={this.jiraURLChange}
              value={this.state.jiraURL} />
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
            <input
              className={this.state.invalidState && this.state.invalidState.gitHubOwnerInvalid ? 'invalid' : ''}
              type="text"
              disabled={this.state.gitHubScope === 'all'}
              onChange={this.gitHubOwnerChange}
              value={this.state.gitHubOwner}/>
            <label>Repository:</label>
            <input 
              className={this.state.invalidState && this.state.invalidState.gitHubRepoInvalid ? 'invalid' : ''}
              type="text"
              disabled={this.state.gitHubScope !== 'single'}
              onChange={this.gitHubRepoChange}
              value={this.state.gitHubRepo} />
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

.error-message {
  border-top: 2px solid ${p => p.theme.colorRed};
  border-bottom: 2px solid ${p => p.theme.colorRed};
  padding: 10px;
  background: #060606;
  color: ${p => p.theme.colorRed};

  button {
    margin: 0 10px;

  }
}

input {
  background: #111;
  border: 1px solid #222;
  padding: 3px 7px;
  color: #fff;
  border-radius: 3px;

  &.invalid {
    border-color: ${p => p.theme.colorRed};
  }

  &:disabled {
    opacity: 0.7;
  }
}

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
  return (
    <ThemeProvider theme={defaultTheme}>
      <StyledStage />
    </ThemeProvider>
    );
}
