import {CONFIG} from '../shared/config';
import { missingOriginPermissions } from '../shared/permissions';

/**
 * Maintained list of origins that we have permission for
 */
const grantedOrigins = new Set<string>();

/**
 * Update the value of grantedOrigins based on the current list of permissions
 */
function checkPermissions() {
  console.log('checking permissions');
  chrome.permissions.getAll(permissions => {
    grantedOrigins.clear();
    if (permissions.origins) {
      for (const origin of permissions.origins)
        grantedOrigins.add(origin);
    }
    console.log('permissions: ', permissions, grantedOrigins);
  });
}

// Check permissions on startup, and when changes.
checkPermissions();
chrome.permissions.onAdded.addListener(checkPermissions);
chrome.permissions.onRemoved.addListener(checkPermissions);


/**
 * TODO: create a warning icon when permissions are not correct
 * TODO: create configuration page
 */
chrome.browserAction.onClicked.addListener(tab => {
  chrome.runtime.openOptionsPage();
  // TODO: move the following to the options page
  const missingOrigins = missingOriginPermissions(CONFIG, grantedOrigins);
  console.log('Missing Origins:', missingOrigins);
  if (missingOrigins.length > 0) {
    chrome.permissions.request({origins: missingOrigins});
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    intectContentScripts(tab);
  }
});

chrome.tabs.query({}, tabs => {
  tabs.map(intectContentScripts);
});

function intectContentScripts(tab: chrome.tabs.Tab) {
  // Check if we can read the URL
  if (!tab.url || !tab.id) return;
  const url = new URL(tab.url);
  for (const config of CONFIG) {
    if (url.host === config.gitHubDomain) {
      chrome.tabs.executeScript(tab.id, {
        file: 'content-scripts/github.js'
      });
    }
  }
}
