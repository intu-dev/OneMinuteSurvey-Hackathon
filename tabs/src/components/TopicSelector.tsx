import { useContext } from "react";
import { Dropdown, Loader } from "@fluentui/react-northstar";
import { useData } from "@microsoft/teamsfx-react";
import { TeamsFxContext } from "./Context";
import { callFunction } from "./CallFunction";

export function TopicSelector( props: { onSelectedItemChange: (e: any)=>void } ) {
  const teamsfx = useContext(TeamsFxContext).teamsfx;
  const { loading, data, error, reload } = useData(
    () => callFunction(teamsfx, "get", "templates"),
    {
      autoLoad: true,
    }
  );
  return (
    <div>
      {!loading && (
        <Dropdown
          items={data.map((q: any) => { return { key: q.id, header: q.topic, data: q}})}
          placeholder="Select a topic"
          checkable
          getA11ySelectionMessage={{
            onAdd: (item) => `${item} has been selected.`,
          }}
          onChange = {(e, data) => props.onSelectedItemChange(data.value)}
        />
      )}
      {/* {!loading && !!data && !error && <pre className="fixed">{JSON.stringify(data, null, 2)}</pre>}
      {!loading && !data && !error && <pre className="fixed"></pre>} */}
      {!loading && !!error && (
        <div className="error fixed">{(error as any).toString()}</div>
      )}
    </div>
  );
}
