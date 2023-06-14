import { useContext } from "react";
import { Dropdown } from "@fluentui/react-northstar";
import { useGraph } from "@microsoft/teamsfx-react";
import { TeamsFxContext } from "./Context";
import { TeamsFxProvider } from "@microsoft/mgt-teamsfx-provider";
import { Providers, ProviderState } from "@microsoft/mgt-element";

export function RecipientSelector( props: { onSelectedItemChange: (e: any)=>void } ) {
  const teamsfx = useContext(TeamsFxContext).teamsfx;

  const { loading, data, error, reload } = useGraph(
    async (graph, teamsfx, scope) => {
      // Call graph api directly to get user profile information
      //await teamsfx.login(scope);
      const teams: any = await graph.api("/me/joinedTeams").get();

      // Initialize Graph Toolkit TeamsFx provider
      // const provider = new TeamsFxProvider(teamsfx, scope);
      // Providers.globalProvider = provider;
      // Providers.globalProvider.setState(ProviderState.SignedIn);

      console.log(teams)
      return teams; // { profile, photoUrl };
    },
    { scope: ["Team.ReadBasic.All"], teamsfx: teamsfx }
  );

  return (
    <div>
      {!loading && !error && (
        <Dropdown
          items={data.map((q: any) => { return {id: q.id, header: q.displayName}})}
          placeholder="Select a team"
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
