import React from 'react'
import { PublicClientApplication } from '@azure/msal-browser';
import { ChromeLogin, ChromeLogout, MsalConfig } from '../../content/login';

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
    <div>
      <h1>Extension Setting</h1>
      <p>If you are seeing this, React is working!</p>
      {token ? (
        <div>
          <p>You have login successfully.</p>
          <p>Token: {token}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}

export default App
