import { useContext, useState } from "react";
import { Alert, Button, Loader } from "@fluentui/react-northstar";
import { useData } from "@microsoft/teamsfx-react";

import { TeamsFxContext } from "./Context";
import { callFunction } from "./CallFunction";
import { TopicSelector } from "./TopicSelector";
import { RecipientSelector } from "./RecipientSelector";

export function CreateSurvey() {
  const teamsfx = useContext(TeamsFxContext).teamsfx;
  const [selectedTopic, setSelectedTopic] = useState<any | undefined>(null);

  const getData = () => {
    console.log("Getting data");
    return { topic: selectedTopic?.id, questions: selectedTopic?.questions };
  };

  //TODO useData probably not the best fit for just triggering an action
  //TODO Popup to confirm creating the survey - https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/design/design-teams-app-basic-ui-components#alert
  const { loading, data, error, reload } = useData(
    () => callFunction(teamsfx, "post", "surveys", getData()),
    {
      autoLoad: false,
    }
  );
  return (
    <div>
      {!loading && !data && !error && (
        <>
          <label htmlFor="question">What are you trying to assess?</label>
          <TopicSelector
            onSelectedItemChange={(e) => {
              setSelectedTopic(e.data);
            }}
          />

          {/* <RecipientSelector onSelectedItemChange={ (e) => console.log(e) } /> */}
          {/* <p>This will send the survey to X users</p> */}

          <Button
            primary
            content="Create Survey"
            disabled={loading || selectedTopic == null}
            onClick={reload}
          />
        </>
      )}

      {loading && (
        <pre className="fixed">
          {" "}
          <Loader />{" "}
        </pre>
      )}
      {!loading && !!data && !error && (
        <Alert
          success
          content="Survey created - results can be seen under 'View surveys'"
        />
      )}
      {!loading && !!error && (
        <Alert
          danger
          content={`Error sending survey - ${(error as any).toString()}`}
        />
      )}
    </div>
  );

  //TODO
  // Use mgt-people-picker to select which groups/users to send the survey to
  // https://learn.microsoft.com/en-us/graph/toolkit/components/people-picker
  //
  // Or mgt-teams-channel-picker to choose a team who's members should receive the survey
  // https://learn.microsoft.com/en-us/graph/toolkit/components/teams-channel-picker
  //
  //
}
