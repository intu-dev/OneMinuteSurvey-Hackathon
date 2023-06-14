import { useState, useContext } from "react";
import { TeamsFxContext } from "./Context";
import { Image, Menu } from "@fluentui/react-northstar";
import "./Tab.css";
import { SurveyList } from "./SurveyList";
import { CreateSurvey } from "./CreateSurvey";

export default function Tab() {
  const { themeString } = useContext(TeamsFxContext);
  const environment = window.location.hostname === "localhost" ? "local" : "azure";
  const friendlyEnvironmentName =
    {
      local: "local environment",
      azure: "Azure environment",
    }[environment] || "local environment";

  const steps = ["create", "view"];
  const friendlyStepsName: { [key: string]: string } = {
    view: "View Surveys",
    create: "Create New Survey",
  };
  const [selectedMenuItem, setSelectedMenuItem] = useState("create");
  const items = steps.map((step) => {
    return {
      key: step,
      content: friendlyStepsName[step] || "",
      onClick: () => setSelectedMenuItem(step),
    };
  });

  return (
    <div className={themeString === "default" ? "" : "dark"}>
      <div className="welcome page">
        <div className="narrow page-padding">
          <Image src="survey_fox.png" />
          <h1 className="center">One Minute Maturity Score</h1>
          <div>Fast and easy way to ask almost any question of your team - and compare the results to your expected opinion.</div>

          <Menu defaultActiveIndex={0} items={items} underlined secondary />
          <div className="sections">
            {selectedMenuItem === "view" && (
              <div>
                <SurveyList />
              </div>
            )}
            {selectedMenuItem === "create" && (
              <div>
                <CreateSurvey />
              </div>
            )}
          </div>
          {/* <p className="center">&copy; 2023 v0.0.0 - {friendlyEnvironmentName}</p>  */}
          
        </div>
      </div>
    </div>
  );
}
