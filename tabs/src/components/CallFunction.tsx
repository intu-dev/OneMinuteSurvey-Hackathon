import * as axios from "axios";
import { BearerTokenAuthProvider, createApiClient, TeamsFx } from "@microsoft/teamsfx";

export async function callFunction(teamsfx: TeamsFx | undefined, method: string, route: string, data?: any) {
  if (!teamsfx) {
    throw new Error("TeamsFx SDK is not initialized.");
  }
  try {
    const credential = teamsfx.getCredential();
    const apiBaseUrl = teamsfx.getConfig("apiEndpoint") + "/api/";

    // createApiClient(...) creates an Axios instance which uses BearerTokenAuthProvider to inject token to request header
    const apiClient = createApiClient(
      apiBaseUrl,
      new BearerTokenAuthProvider(async () => (await credential.getToken(""))!.token));

    let response = null;
    switch (method) {
      case "get":
        response = await apiClient.get(route);
        break;
      case "post":
        response = await apiClient.post(route, data);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    return response.data;
  } catch (err: unknown) {
    if (axios.default.isAxiosError(err)) {
      let funcErrorMsg = "";

      if (err?.response?.status === 404) {
        funcErrorMsg = `There may be a problem with the deployment of Azure Function App, please deploy Azure Function (Run command palette "Teams: Deploy to the cloud") first before running this App`;
      } else if (err.message === "Network Error") {
        funcErrorMsg =
          "Cannot call Azure Function due to network error, please check your network connection status and ";
        if (err.config?.url && err.config.url.indexOf("localhost") >= 0) {
          funcErrorMsg += `make sure to start Azure Function locally (Run "npm run start" command inside api folder from terminal) first before running this App`;
        } else {
          funcErrorMsg += `make sure to provision and deploy Azure Function (Run command palette "Teams: Provision in the cloud" and "Teams: Deploy to the cloud) first before running this App`;
        }
      } else {
        funcErrorMsg = err.message;
        if (err.response?.data?.error) {
          funcErrorMsg += ": " + err.response.data.error;
        }
      }

      throw new Error(funcErrorMsg);
    }
    throw err;
  }
}
