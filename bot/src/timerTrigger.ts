import { AzureFunction, Context } from "@azure/functions";
import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
const { TableClient } = require("@azure/data-tables");

import introTemplate from "./adaptiveCards/survey-introduction.json";
import { IntroCardData } from "./cardModels";
import { bot } from "./internal/initialize";

// An Azure Function timer trigger.
//
// This function fires periodically. You can adjust the schedule in `../timerNotifyTrigger/function.json`.
const timerTrigger: AzureFunction = async function (
  context: Context,
  myTimer: any
): Promise<void> {
  const tableClient = TableClient.fromConnectionString(
    process.env.DatabaseStorage,
    "surveys"
  );

  const pendingSurveys = await tableClient.listEntities({
    queryOptions: { filter: "status eq 'PENDING'" },
  });

  for await (const survey of pendingSurveys) {
    await sendSurvey(context, survey, tableClient);
  }

  // var myStartDate = new Date(new Date().getTime() - (72 * 60 * 60_000)).toISOString();
  // const runningSurveys = await tableClient.listEntities({
  //   queryOptions: {
  //     filter: `status eq 'RUNNING' and executedAt lt datetime'${myStartDate}'`,
  //   },
  // });

  // for await (const survey of runningSurveys) {
  //   completeSurvey(survey, tableClient);
  // }
};

async function sendSurvey(context: Context, survey: any, tableClient: any) {
  try {
    const timeStamp = new Date().toISOString();

    context.log("Executing survey " + survey.rowKey);
    let sendCount = 0;
    for (const target of await bot.notification.installations()) {
      try {
        //TODO Choose the right people to recieve the message, ie only people, not channels, and only a subset of the users
        const questions = JSON.parse(survey.questions);

        // Send the survey introduction
        await target.sendAdaptiveCard(
          AdaptiveCards.declare<IntroCardData>(introTemplate).render({
            title: `You have been invited to take part in a survey by ${survey.createdBy}`,
            description: `This survey consists of ${questions.length} questions.  Click next when you're ready to start.  Your responses will be visible to the sender of the survey.`,
            image:
              "https://majestic-moonbeam-390399.netlify.app/survey_fox.png",
            surveyId: `${survey.rowKey}`,
          })
        );

        sendCount++;

        //TODO Record who we sent messages to?
      } catch (error) {
        context.log(error);
      }
    }
    // Now we have sent the messages, mark the survey as disabled and update the last run time
    await tableClient.updateEntity({
      ...survey,
      status: "RUNNING",
      executedAt: timeStamp,
      sendCount,
      responses: 0,
    });
  } catch (error) {
    context.log(error);
  }
}

async function completeSurvey(survey, tableClient) {
  try {
    console.log(`Finishing ${survey.rowKey}`);

    const surveyCreator = await bot.notification.findMember(
      async (m) => m.account.userPrincipalName === survey.createdBy
    );
    surveyCreator.sendMessage(
      `Your survey has now ended.  It received ${survey.responses} responses.  Click on the "Manage Surveys" tab to view the results.`
    );

    await tableClient.updateEntity({
      ...survey,
      status: "ENDED",
    });
  } catch (error) {
    console.error(error);
  }
}

export default timerTrigger;
