import { Configuration } from "@azure/msal-browser";

export const MsalConfig: Configuration = {
  auth: {
    clientId: '84771574-3cfe-442d-964f-c9fc3db201ce',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: chrome.runtime.getURL('pages/popup/index.html'),
  }
};

export const ChromeLogin = function(callback: (token: string) => any) {
    const clientId = MsalConfig.auth.clientId;
    const redirectUri = chrome.identity.getRedirectURL();
    console.log("redirect page is " + redirectUri);

    const authUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?' +
      'client_id=' + clientId +
      '&response_type=token' +
      '&redirect_uri=' + encodeURIComponent(redirectUri) +
      '&scope=' + encodeURIComponent('Tasks.ReadWrite,User.Read');
  
    chrome.identity.launchWebAuthFlow({url: authUrl, interactive: true}, function(responseUrl) {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
        return;
      }
  
      const params = new URLSearchParams(responseUrl?.split('#')[1]);
      const token = params.get('access_token');

      console.log("Get tokenurl is :" + String(responseUrl))
      console.log("Get token is :" + String(token))
  
      // Store token
      callback(token!);
    })
};

export const ChromeLogout = function(token: string) {
  chrome.identity.removeCachedAuthToken({token: token});
}
