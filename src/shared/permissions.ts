import { LinkConfiguration } from './config';
import * as config from './config';

/**
 * Assuming that grantedOrigins is up to date, calculate which permissions
 * we're missing for the current configuration
 */
export function missingOriginPermissions(config: LinkConfiguration[], grantedOrigins: Set<string>): string[] {
  const missing = new Set<string>();
  for (const conf of config) {
    const gh = `https://${conf.gitHubDomain}/*`;
    const jira = `${conf.jiraBaseUrl}/*`;
    if (!grantedOrigins.has(gh)) missing.add(gh);
    if (!grantedOrigins.has(jira)) missing.add(jira);
  }
  return Array.from(missing);
}

/**
 * Assuming that grantedOrigins is up to date, calculate which permissions
 * we no longer need for the current configuration
 */
export function unneededOriginPermissions(config: LinkConfiguration[], grantedOrigins: Set<string>): string[] {
  const needed = new Set<string>();
  for (const conf of config) {
    needed.add(`https://${conf.gitHubDomain}/*`);
    needed.add(`${conf.jiraBaseUrl}/*`);
  }
  const unneeded = new Set<string>();
  for (const origin of grantedOrigins) {
    if (!needed.has(origin))
      unneeded.add(origin);
  }
  return Array.from(unneeded);
}
