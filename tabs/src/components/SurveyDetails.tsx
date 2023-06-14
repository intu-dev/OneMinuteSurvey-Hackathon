import { useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { useData } from "@microsoft/teamsfx-react";
import { Button, Loader, Image, CloseIcon, ArrowLeftIcon, Flex } from "@fluentui/react-northstar";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";

import { TeamsFxContext } from "./Context";
import "./Tab.css";
import { callFunction } from "./CallFunction";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

let valueMap = new Map([
  [ 1, "Never" ],
  [ 2, "Rarely" ],
  [ 3, "Often" ],
  [ 4, "Always" ],
]);

let colourMap = new Map([
  [ 'Maximum', { border: "rgba(43, 245, 95, 1)", bg: "rgba(43, 245, 95, 0.2)"} ],
  [ 'Average', { border: "rgba(245, 215, 45, 1)", bg: "rgba(245, 215, 45, 0.2)"} ],
  [ 'Minimum', { border: "rgba(255, 99, 132, 1)", bg: "rgba(255, 99, 132, 0.2)"} ],
]);

const options = {
  scales: {
    r: {
      beginAtZero: true,
      min: 0,
      max: 4,
      ticks: {
        stepSize: 1,
        callback: function(value: string | number, index: number, ticks: any) {
            return valueMap.get(value as number) ?? "Null";
        }
      },
    },
  },
};

function transformData(data: any) {
  const chartData = {
    labels: data.questions,
    datasets: data.results.map((r: any, index: number) => {
      console.log(JSON.stringify(r))
      return {
        label: r.name,
        data: r.values,
        backgroundColor: colourMap.get(r.name)?.bg,
        borderColor: colourMap.get(r.name)?.border,
        borderWidth: 3,
      };
    }),
  };

  return {
    survey: { id: data.surveyId },
    responseCount: data.responseCount,
    chartData,
  };
}

export default function SurveyDetails() {
  const { themeString } = useContext(TeamsFxContext);
  let { id } = useParams<{ id: string }>();
  const teamsfx = useContext(TeamsFxContext).teamsfx;
  const { loading, data, error, reload } = useData(
    () => {
      return callFunction(teamsfx, "get", `survey/${id}`).then((response) =>
        transformData(response)
      );
    },
    {
      autoLoad: true,
    }
  );

  return (
    <div className={themeString === "default" ? "" : "dark"}>
      <div className="welcome page">
        <div className="narrow page-padding">
          <div className="right">
            <Link to={`/tab`}><ArrowLeftIcon /> Back</Link>
          </div>

          <h1 className="center">One Minute Maturity Score - Survey Results</h1>

          {loading && (
            <pre className="fixed">
              {" "}
              <Loader />{" "}
            </pre>
          )}
          {!loading && !!data && !error && (
            <>
              <Flex style={{maxHeight: '500px'}} hAlign="center">
                <Radar data={data.chartData} options={options} />
              </Flex>
              <p>{data.responseCount} response{data.responseCount != 1 && 's'}</p>
            </>
          )}
          {!loading && !data && !error && <pre className="fixed"></pre>}
          {!loading && !!error && (
            <div className="error fixed">{(error as any).toString()}</div>
          )}
        </div>
      </div>
    </div>
  );
}
