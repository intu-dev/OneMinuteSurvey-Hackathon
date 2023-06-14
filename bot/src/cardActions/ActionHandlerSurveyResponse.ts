import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import {
  InvokeResponseFactory,
  TeamsFxAdaptiveCardActionHandler,
} from "@microsoft/teamsfx";
import { InvokeResponse, TurnContext } from "botbuilder";
const { TableClient } = require("@azure/data-tables");

import { NumericSurveyCardData, SurveyCompleteCardData } from "../cardModels";
import surveyTemplate from "../adaptiveCards/numeric-survey-question.json";
import completedTemplate from "../adaptiveCards/survey-completed.json";

function getTableClient(table: string) {
  return TableClient.fromConnectionString(
    process.env.DatabaseStorage,
    table
  );
}

export class ActionHandlerSurveyResponse
  implements TeamsFxAdaptiveCardActionHandler
{
  triggerVerb = "surveyResponse";

  async handleActionInvoked(
    context: TurnContext,
    actionData: any
  ): Promise<InvokeResponse> {
    //console.log("Handler received " + JSON.stringify(context));
    //console.log("actionData" + JSON.stringify(actionData));

    const surveyTable = getTableClient("surveys")
    const responsesTable = getTableClient("surveyResponses")

    // Save the response and update the survey
    const survey = await surveyTable.getEntity("0", actionData.surveyId);
    const questions = JSON.parse(survey.questions);

    //TODO Don't allow duplicate responses (or do allow people to correct mistakes?)
    const response = {
      partitionKey: actionData.surveyId,
      rowKey: `${context.activity.from.id}-${actionData.questionIndex}`,
      userId: context.activity.from.id,
      questionId: questions[actionData.questionIndex],
      response: actionData.response,
    };

    await responsesTable.createEntity(response);

    let card = null;
    let nextQuestionIndex = actionData.questionIndex + 1;

    if (nextQuestionIndex < questions.length) {
      console.log("Showing next question" + nextQuestionIndex);

      // Send the next question
      const questionClient = getTableClient("questions")

      const nextQuestion = await questionClient.getEntity(
        "0",
        `${questions[nextQuestionIndex]}`
      );

      card = AdaptiveCards.declare<NumericSurveyCardData>(
        surveyTemplate
      ).render({
        question: nextQuestion.question,
        description: `On a scale of 1-5, 5 being always, 1 being never.`,
        image:
          "https://majestic-moonbeam-390399.netlify.app/survey_fox.png",
        surveyId: `${survey.rowKey}`,
        questionIndex: nextQuestionIndex,
        questionCount: questions.length,
      });
    } else {
      // Mark the survey as completed
      survey.responses = survey.responses + 1;
      await surveyTable.updateEntity(survey);

      // Send a message saying the response as complete
      //TODO include a confirm results step (last chance to go back and change answers)
      card = AdaptiveCards.declare<SurveyCompleteCardData>(completedTemplate).render({
        title:
          "Survey Complete!",
        description:
          "Thank you for completing this One Minute Survey.",
        image:
          "https://majestic-moonbeam-390399.netlify.app/survey_fox.png",
      });
    }

    const activity = {
      type: "message",
      id: context.activity.replyToId,
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          content: card,
        },
      ],
    };

    // Replace the card with the new one
    await context.updateActivity(activity);

    return InvokeResponseFactory.textMessage(
      "This is a sample card action response!"
    );
  }
}
