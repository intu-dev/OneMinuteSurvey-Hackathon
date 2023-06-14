/* This code sample provides a starter kit to implement server side logic for your Teams App in TypeScript,
 * refer to https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference for complete Azure Functions
 * developer guide.
 */

// Import polyfills for fetch required by msgraph-sdk-javascript.
import "isomorphic-fetch";
import { Context, HttpRequest } from "@azure/functions";
import { Client } from "@microsoft/microsoft-graph-client";
import { createMicrosoftGraphClientWithCredential, OnBehalfOfCredentialAuthConfig, OnBehalfOfUserCredential, UserInfo } from "@microsoft/teamsfx";

interface Response {
  status: number;
  body: { [key: string]: any };
}

type TeamsfxContext = { [key: string]: any };

/**
 * This function handles requests from teamsfx client.
 * The HTTP request should contain an SSO token queried from Teams in the header.
 * Before trigger this function, teamsfx binding would process the SSO token and generate teamsfx configuration.
 *
 * This function initializes the teamsfx SDK with the configuration and calls these APIs:
 * - new OnBehalfOfUserCredential(accessToken, oboAuthConfig) - Construct OnBehalfOfUserCredential instance with the received SSO token and initialized configuration.
 * - getUserInfo() - Get the user's information from the received SSO token.
 * - createMicrosoftGraphClientWithCredential() - Get a graph client to access user's Microsoft 365 data.
 *
 * The response contains multiple message blocks constructed into a JSON object, including:
 * - An echo of the request body.
 * - The display name encoded in the SSO token.
 * - Current user's Microsoft 365 profile if the user has consented.
 *
 * @param {Context} context - The Azure Functions context object.
 * @param {HttpRequest} req - The HTTP request.
 * @param {teamsfxContext} TeamsfxContext - The context generated by teamsfx binding.
 */
export default async function run(
  context: Context,
  req: HttpRequest,
  teamsfxContext: TeamsfxContext
): Promise<Response> {
  context.log("HTTP trigger function processed a request.");

  // Initialize response.
  const res: Response = {
    status: 200,
    body: {},
  };

  // Put an echo into response body.
  res.body.receivedHTTPRequestBody = req.body || "";

  // Prepare access token.
  const accessToken: string = teamsfxContext["AccessToken"];
  if (!accessToken) {
    return {
      status: 400,
      body: {
        error: "No access token was found in request header.",
      },
    };
  }

  const oboAuthConfig: OnBehalfOfCredentialAuthConfig = {
    authorityHost: process.env.M365_AUTHORITY_HOST,
    clientId: process.env.M365_CLIENT_ID,
    tenantId: process.env.M365_TENANT_ID,
    clientSecret: process.env.M365_CLIENT_SECRET,
  };
  
  let oboCredential: OnBehalfOfUserCredential;
  
  try {
    oboCredential = new OnBehalfOfUserCredential(accessToken, oboAuthConfig);
  } catch (e) {
    context.log.error(e);
    return {
      status: 500,
      body: {
        error:
          "Failed to construct OnBehalfOfUserCredential using your accessToken. " +
          "Ensure your function app is configured with the right Azure AD App registration.",
      },
    };
  }

  // Query user's information from the access token.
  try {
    const currentUser: UserInfo = await oboCredential.getUserInfo();
    if (currentUser && currentUser.displayName) {
      res.body.userInfoMessage = `User display name is ${currentUser.displayName}.`;
    } else {
      res.body.userInfoMessage = "No user information was found in access token.";
    }
  } catch (e) {
    context.log.error(e);
    return {
      status: 400,
      body: {
        error: "Access token is invalid.",
      },
    };
  }

  // Create a graph client with default scope to access user's Microsoft 365 data after user has consented. 
  try {
    const graphClient: Client = createMicrosoftGraphClientWithCredential(oboCredential, [".default"]);
  
    const profile: any = await graphClient.api("/me").get();
    res.body.graphClientMessage = profile;
  } catch (e) {
    context.log.error(e);
    return {
      status: 500,
      body: {
        error:
          "Failed to retrieve user profile from Microsoft Graph. The application may not be authorized.",
      },
    };
  }

  return res;
}

// You can replace the codes above from the function body with comment "Query user's information from the access token." to the end 
// with the following codes to use application permission to get user profiles. 
// Remember to get admin consent of application permission "User.Read.All".
/*
// Query user's information from the access token.
  let userName: string;
  try {
    const currentUser: UserInfo = await teamsfx.getUserInfo();
    console.log(currentUser);
    userName = currentUser.preferredUserName; // Will be used in app credential flow
    if (currentUser && currentUser.displayName) {
      res.body.userInfoMessage = `User display name is ${currentUser.displayName}.`;
    } else {
      res.body.userInfoMessage = "No user information was found in access token.";
    }
  } catch (e) {
    context.log.error(e);
    return {
      status: 400,
      body: {
        error: "Access token is invalid.",
      },
    };
  }

  // Use IdentityType.App + client secret to create a teamsfx
  const appAuthConfig: AppCredentialAuthConfig = {
    clientId: process.env.M365_CLIENT_ID,
    clientSecret: process.env.M365_CLIENT_SECRET,
    authorityHost: process.env.M365_AUTHORITY_HOST,
    tenantId: process.env.M365_TENANT_ID,
  };

  try {
    const appCredential = new AppCredential(appAuthConfig);
  } catch (e) {
    context.log.error(e);
    return {
      status: 500,
      body: {
        error:
          "App credential error:" +
          "Failed to construct TeamsFx using your accessToken. " +
          "Ensure your function app is configured with the right Azure AD App registration.",
      },
    };
  }

  // Create a graph client with default scope to access user's Microsoft 365 data after user has consented. 
  try {
    const graphClient: Client = createMicrosoftGraphClientWithCredential(appCredential, [".default"]);
  
    const profile: any = await graphClient.api("/users/"+userName).get();
    res.body.graphClientMessage = profile;
  } catch (e) {
    context.log.error(e);
    return {
      status: 500,
      body: {
        error:
          "Failed to retrieve user profile from Microsoft Graph. The application may not be authorized.",
      },
    };
  }
*/
