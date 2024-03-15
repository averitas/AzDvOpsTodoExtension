import { AuthProvider, AuthProviderCallback, Client, Options } from "@microsoft/microsoft-graph-client";
import { TaskList } from "../../../model/TaskList";

const getGraphClient = function(accessToken: string): Client {
   const authProvider: AuthProvider = (callback: AuthProviderCallback) => {
      if (accessToken) {
         callback(null, accessToken);
      } else {
         callback(new Error('Token not found'), null);
      }
   }

   const options: Options = {
      authProvider
   };
   const graphClient = Client.init(options);
   return graphClient;
}

export const addTask = async function(accessToken: string, title: string, category: string, taskListId: string): Promise<boolean> {  
   const graphClient = getGraphClient(accessToken);
   const todoTask = {
      title: title,
      categories: [category]
   };
  
   try {
      await graphClient.api(`/me/todo/lists/${taskListId}/tasks`)
      .post(todoTask);
      return true;
   }
   catch (error) {
      console.log(error);
      return false;
   }
}

export const getAllTaskLists = async function(accessToken: string): Promise<TaskList[]> {
   const graphClient = getGraphClient(accessToken);
   try {
      const res = await graphClient.api('/me/todo/lists').get();
      console.log("get task lists: " + res.value);
      return res.value;
   }
   catch (error) {
      console.log(error);
      return [];
   }
}

