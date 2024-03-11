console.log('content-script.ts')

const lgoinButton = document.createElement('button')

lgoinButton.addEventListener('click', function() {
    const clientId = 'your-client-id';
    const redirectUri = chrome.identity.getRedirectURL('provider_cb');
    const authUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?' +
      'client_id=' + clientId +
      '&response_type=token' +
      '&redirect_uri=' + encodeURIComponent(redirectUri) +
      '&scope=' + encodeURIComponent('https://graph.microsoft.com/.default');
  
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
      chrome.storage.sync.set({token: token}, function() {
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message);
        } else {
            console.log('Token saved');
        }
      });
    });
  });