import React from 'react'
import { PublicClientApplication } from '@azure/msal-browser';
import { ChromeLogin, ChromeLogout, MsalConfig } from '../../content/login';
import { PrimaryButton, Text, Stack } from '@fluentui/react';

const tokens = {
  sectionStack: {
    childrenGap: 10,
  },
  headingStack: {
    childrenGap: 5,
  },
};

const App = (): JSX.Element => {
  const [token, setToken] = React.useState<string | null>(null);
  const msalInstance = new PublicClientApplication(MsalConfig);

  React.useEffect(() => {
    // Retrieve token from chrome storage
    chrome.storage.local.get(['token'], (result) => {
      setToken(result.token);
    });
  }, []);

  const saveTokenToStorage = function(token: string | null) {
    chrome.storage.local.set({token: token}, function() {
      if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError.message);
      } else {
          console.log('Token saved');
      }
    });
    setToken(token);
  }

  const handleLogin = async () => {
    await msalInstance.initialize();
    try {
      ChromeLogin(function(token: string) {
        saveTokenToStorage(token)
        setToken(token);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = async () => {
    await msalInstance.initialize();
    try {
      ChromeLogout(token!);
      setToken(null);

      // Store token
      saveTokenToStorage(null)
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Stack tokens={tokens.sectionStack} style={{width: 500}}>
      <Text variant='large' block >Extension Setting</Text>
      <Text variant='small' block >Don't login with Microsoft enterprise account! It will fail!</Text>
      <Text variant='small' block >Login with you personal Outlook account, and don't record confidential content in it.</Text>
        {token ? (
          <Stack tokens={tokens.headingStack}>
            <Text variant='small' block >You have login successfully.</Text>
            <Text variant='xSmall' nowrap={false} block >Token: {token}</Text>
            <PrimaryButton onClick={handleLogout}>Logout</PrimaryButton>
          </Stack>
        ) : (
          <Stack tokens={tokens.headingStack}>
            <PrimaryButton onClick={handleLogin}>Personal Outlook account Login</PrimaryButton>
          </Stack>
        )}
    </Stack>
  );
}

export default App
