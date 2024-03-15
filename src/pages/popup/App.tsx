import React from 'react'
// import { PublicClientApplication } from '@azure/msal-browser';
import { ChromeLogin, ChromeLogout } from '../../content/login';
import { PrimaryButton, Text, Stack, TextField, VerticalDivider } from '@fluentui/react';

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
  const [summaryStr, setSummaryStr] = React.useState<string | null>(null);
  const [apiKey, setApiKey] = React.useState<string | null>(null);
  const [openaiEndpoint, setOpenaiEndpoint] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Retrieve token from chrome storage
    chrome.storage.local.get(['token'], (result) => {
      setToken(result.token);
    });
    chrome.storage.local.get(['apiKey'], (result) => {
      setApiKey(result.apiKey);
    });
    chrome.storage.local.get(['openaiEndpoint'], (result) => {
      setOpenaiEndpoint(result.openaiEndpoint);
    });
  }, []);

  const saveAndPersistApiKey = function(key: string | null | undefined) {
    setApiKey(String(key));
    chrome.storage.local.set({apiKey: String(key)}, function() {
      if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError.message);
      } else {
          console.log('Api key saved in chrome.storage');
      }
    });
  }

  const saveAndPersistApiEndpoint = function(endpoint: string | null | undefined) {
    setOpenaiEndpoint(String(endpoint));
    chrome.storage.local.set({openaiEndpoint: String(endpoint)}, function() {
      if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError.message);
      } else {
          console.log('Api endpoint saved in chrome.storage');
      }
    });
  }

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
    try {
      ChromeLogout(String(token));
      setToken(null);

      // Store token
      saveTokenToStorage(null)
    } catch (error) {
      console.log(error);
    }
  };

  const getWorkItems = async () => {
    return new Promise((resolve, reject) => {
      console.log("getWorkItems");
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs){ 
        console.log("tab Id :", tabs[0].id);
        chrome.tabs.sendMessage(tabs[0].id ?? 0, {greeting: "hello"}, function(response) {
          const resp = JSON.stringify(response);
          console.log(resp);
          const workItems = JSON.parse(resp).data;
          const workItemList = workItems.map((item: any, index: number) => `${index + 1}. ${item}`).join("\n");
          resolve(workItemList);
        });
      });
    });
  }

  const handleSummary = async () => {
    // Save api key and endpoint
    saveAndPersistApiEndpoint(openaiEndpoint);
    saveAndPersistApiKey(apiKey);
    try {
      setSummaryStr("Summarizing...");
      const workItemList = await getWorkItems();
      console.log("workItems : ", workItemList);
      const message_text = [{"role":"system","content":"You are an AI assistant that helps summary the work Item List."},{"role":"user","content": `${workItemList}`}]
      const response = await fetch(String(openaiEndpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': String(apiKey),
        },
        body: JSON.stringify({
          messages: message_text,
          max_tokens: 800,
          temperature: 0.7,
          frequency_penalty: 0,
          presence_penalty: 0,
          top_p: 0.95,
          stop: null
        })
      });
  
      if (response.ok) {
        const data = await response.json();
        const completion = JSON.stringify(data.choices[0].message);
        const completionText = JSON.parse(completion).content;
        console.log(`Summarization: ${completionText}`);
        setSummaryStr(completionText);
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Stack tokens={tokens.sectionStack} style={{width: 500}}>
      <Text variant='large' block >Extension Setting</Text>
      <Text variant='small' block >Don&apos;t login with Microsoft enterprise account! It will fail!</Text>
      <Text variant='small' block >Login with you personal Outlook account, and don&apos;t record confidential content in it.</Text>
        {token ? (
          <Stack tokens={tokens.headingStack}>
            <Text variant='small' block >You have login successfully.</Text>
            <PrimaryButton onClick={handleLogout}>Logout</PrimaryButton>
          </Stack>
        ) : (
          <Stack tokens={tokens.headingStack}>
            <PrimaryButton onClick={handleLogin}>Personal Outlook account Login</PrimaryButton>
          </Stack>
        )}
      <VerticalDivider />
      <Text variant='large' block >Summary This page:</Text>
      <TextField
        value={String(apiKey)}
        label="Openai API key" 
        onChange={(event, newValue) => {
          setApiKey(String(newValue));
        }}
        type="password"
        canRevealPassword
        revealPasswordAriaLabel="Show password"/>
      <TextField
        value={String(openaiEndpoint)}
        label="Openai API endpoint URL" 
        onChange={(event, newValue) => {
          setOpenaiEndpoint(String(newValue));
        }}/>
      <Stack tokens={tokens.headingStack}>
        <PrimaryButton onClick={handleSummary}>Summary</PrimaryButton>
      </Stack>
      <VerticalDivider />
      {summaryStr && <Text variant='small' block >Summary: {summaryStr}</Text>}
    </Stack>
  );
}

export default App
