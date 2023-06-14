import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import { InvokeResponseFactory, TeamsFxAdaptiveCardActionHandler } from "@microsoft/teamsfx";
import { ActivityTypes, InvokeResponse, TurnContext } from "botbuilder";

import { NumericSurveyCardData } from "../cardModels";
import surveyTemplate from "../adaptiveCards/numeric-survey-question.json";

const { TableClient } = require("@azure/data-tables");

function getTableClient(table: string) {
  return TableClient.fromConnectionString(
    process.env.DatabaseStorage,
    table
  );
}

export class ActionHandlerSurveyStart implements TeamsFxAdaptiveCardActionHandler {
  triggerVerb = "surveyStart";

  async handleActionInvoked(
    context: TurnContext,
    actionData: any
  ): Promise<InvokeResponse<any>> {
    try {
      console.log(context.activity.value.action.verb);
      //console.log("Handler received " + JSON.stringify(context));
      console.log("actionData" + JSON.stringify(actionData));

      const surveyTable = getTableClient("surveys")
      const questionTable = getTableClient("questions")
    
      const survey = await surveyTable.getEntity("0", actionData.surveyId)
      const questions = JSON.parse(survey.questions)
      const firstQuestion = await questionTable.getEntity("0", `${questions[0]}`)

      const card = AdaptiveCards.declare<NumericSurveyCardData>(surveyTemplate).render({
        question: firstQuestion.question,
        description: `On a scale of 1-5, 5 being always, 1 being never.`,
        image:
          "https://majestic-moonbeam-390399.netlify.app/survey_fox.png",
        surveyId: `${survey.rowKey}`,
        questionIndex: 0,
        questionCount: questions.length
      })
        
      const activity = {
        type: 'message',
        id: context.activity.replyToId,
        attachments: [ {
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: card        
        } ]
      };

      // Replace the card with the new one
      await context.updateActivity(activity);

      // This doesn't do anything, but return something anyway
      return InvokeResponseFactory.textMessage('OK')
        
    } catch (error) {
      console.log(error)
      return InvokeResponseFactory.textMessage('Error')      
    }
  }
}
