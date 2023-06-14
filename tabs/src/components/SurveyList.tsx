import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Loader } from "@fluentui/react-northstar";
import { useData } from "@microsoft/teamsfx-react";
import { TeamsFxContext } from "./Context";
import DownloadResultsButton from "./DownloadResultsButton";
import { callFunction } from "./CallFunction";

export function SurveyList() {
  const [ selectedSurvey, setSelectedSurvey ] = useState<number>(-1)

  const teamsfx = useContext(TeamsFxContext).teamsfx;
  const { loading, data, error, reload } = useData(
    () => callFunction(teamsfx, 'get', 'surveys'),
    {
      autoLoad: true,
    }
  );
  return (
    <div>
      <Button
        primary
        content="Refresh Survey List"
        disabled={loading}
        onClick={reload}
      />
      {loading && (
        <pre className="fixed">
          {" "}
          <Loader />{" "}
        </pre>
      )}
      {!loading && !!data && !error && (
        //TODO Show in a list - https://63587347138fdad13ed63ccd-omfbjvvebn.chromatic.com/?path=/story/ui-templates-lists--kitchen-sink
        <>    
          {selectedSurvey >= 0 && <Button as={Link} to={`/survey/${data[selectedSurvey].id}`} />}

          {/* <Button as={Link} to={`/survey/${data[selectedSurvey].id}`} /> */}
          
          {data.map((s: any, index: number) => (
            <p>
              {index + 1} -
              {s.status === 'PENDING' && "Pending"}
              {s.status !== 'PENDING' && <>
                Sent at {s.executedAt} ({s.sendCount} recipients, {s.responses} responses) {" "}
                {s.responses > 0 && <Button content="View Results" as={Link} to={`/survey/${s.rowKey}`} />}
                {/* {s.responses > 0 && <Button content="View Results" onClick={() => setSelectedSurvey(index) } />} */}
                {/* <DownloadResultsButton surveyId={s.rowKey} />} */}
              </>}
            </p>
          ))}
        </>
      )}
      {!loading && !data && !error && <pre className="fixed"></pre>}
      {!loading && !!error && (
        <div className="error fixed">{(error as any).toString()}</div>
      )}
    </div>
  );
}
