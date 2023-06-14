import { ConversationBot } from "@microsoft/teamsfx";

import { ActionHandlerSurveyResponse } from "../cardActions/ActionHandlerSurveyResponse";
import { ActionHandlerSurveyStart } from "../cardActions/ActionHandlerSurveyStart";
import config from "./config";
import { BlobStorage } from "./blobStorage";

// Create bot.
export const bot = new ConversationBot({
  // The bot id and password to create BotFrameworkAdapter.
  // See https://aka.ms/about-bot-adapter to learn more about adapters.
  adapterConfig: {
    appId: config.botId,
    appPassword: config.botPassword,
  },
  // Enable notification
  notification: {
    enabled: true,
    storage: new BlobStorage(process.env.AzureWebJobsStorage, "conversations"),
  },
  cardAction: {
    enabled: true,
    actions: [
      new ActionHandlerSurveyResponse(),
      new ActionHandlerSurveyStart(),
    ]
  },
  // command: {
  //   enabled: true,
  //   commands: [ new HelloWorldCommandHandler() ],
  // },
});
