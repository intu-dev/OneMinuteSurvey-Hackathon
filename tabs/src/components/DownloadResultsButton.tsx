import React, { useContext } from "react";
import PropTypes from "prop-types";
import { useData } from "@microsoft/teamsfx-react";
import {
  BearerTokenAuthProvider,
  createApiClient,
  TeamsFx,
} from "@microsoft/teamsfx";
import * as axios from "axios";

import { TeamsFxContext } from "./Context";
import { Button } from "@fluentui/react-northstar";

function download(filename: string, text: string) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

async function callGetFunction(surveyId: string, teamsfx?: TeamsFx) {
  if (!teamsfx) {
    throw new Error("TeamsFx SDK is not initialized.");
  }
  try {
    const credential = teamsfx.getCredential();
    const apiBaseUrl = teamsfx.getConfig("apiEndpoint") + "/api/";

    // createApiClient(...) creates an Axios instance which uses BearerTokenAuthProvider to inject token to request header
    const apiClient = createApiClient(
      apiBaseUrl,
      new BearerTokenAuthProvider(
        async () => (await credential.getToken(""))!.token
      )
    );

    const response = await apiClient.get("survey/" + surveyId);

    download("survey-results.txt", JSON.stringify(response.data));

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

const DownloadResultsButton = (props: { surveyId: string }) => {
  const teamsfx = useContext(TeamsFxContext).teamsfx;
  const { loading, data, error, reload } = useData(
    () => callGetFunction(props.surveyId, teamsfx),
    {
      autoLoad: false,
    }
  );

  return (
    <Button content="Download Results" onClick={reload} loading={loading} />
  );
};

DownloadResultsButton.propTypes = { surveyId: PropTypes.string.isRequired };

export default DownloadResultsButton;
