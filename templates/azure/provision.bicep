@secure()
param provisionParameters object


/*
  DB
*/
module databaseProvision './provision/database.bicep' = {
  name: 'databaseProvision'
  params: {
    provisionParameters: provisionParameters
  }
}

output databaseOutput object = {
  storageResourceId: databaseProvision.outputs.resourceId
  storageConnectionString: databaseProvision.outputs.connectionString
}

/*
  Tab
*/
module frontendHostingProvision './provision/frontendHosting.bicep' = {
  name: 'frontendHostingProvision'
  params: {
    provisionParameters: provisionParameters
  }
}

output frontendHostingOutput object = {
  teamsFxPluginId: 'fx-resource-frontend-hosting'
  domain: frontendHostingProvision.outputs.domain
  endpoint: frontendHostingProvision.outputs.endpoint
  indexPath: frontendHostingProvision.outputs.indexPath
  storageResourceId: frontendHostingProvision.outputs.resourceId
}

/*
  Identity
*/
module userAssignedIdentityProvision './provision/identity.bicep' = {
  name: 'userAssignedIdentityProvision'
  params: {
    provisionParameters: provisionParameters
  }
}

output identityOutput object = {
  teamsFxPluginId: 'fx-resource-identity'
  identityName: userAssignedIdentityProvision.outputs.identityName
  identityResourceId: userAssignedIdentityProvision.outputs.identityResourceId
  identityClientId: userAssignedIdentityProvision.outputs.identityClientId
}

/*
  API
*/
module functionProvision './provision/function.bicep' = {
  name: 'functionProvision'
  params: {
    provisionParameters: provisionParameters
    userAssignedIdentityId: userAssignedIdentityProvision.outputs.identityResourceId
    databaseConnectionString: databaseProvision.outputs.connectionString
  }
}

output functionOutput object = {
  teamsFxPluginId: 'fx-resource-function'
  functionAppResourceId: functionProvision.outputs.functionAppResourceId
  functionEndpoint: functionProvision.outputs.functionEndpoint
}

/*
  BOT
*/

// Merge TeamsFx configurations to Bot service
module botProvision './provision/botService.bicep' = {
  name: 'botProvision'
  params: {
    provisionParameters: provisionParameters
    botEndpoint: azureFunctionBotProvision.outputs.functionEndpoint
  }
}

// Resources Azure Function App
module azureFunctionBotProvision './provision/azureFunctionBot.bicep' = {
  name: 'azureFunctionBotProvision'
  params: {
    provisionParameters: provisionParameters
    userAssignedIdentityId: userAssignedIdentityProvision.outputs.identityResourceId
    databaseConnectionString: databaseProvision.outputs.connectionString
  }
}

output azureFunctionBotOutput object = {
  teamsFxPluginId: 'teams-bot'
  sku: azureFunctionBotProvision.outputs.sku
  appName: azureFunctionBotProvision.outputs.appName
  domain: azureFunctionBotProvision.outputs.domain
  appServicePlanName: azureFunctionBotProvision.outputs.appServicePlanName
  functionAppResourceId: azureFunctionBotProvision.outputs.functionAppResourceId
  functionEndpoint: azureFunctionBotProvision.outputs.functionEndpoint
}

output BotOutput object = {
  domain: azureFunctionBotProvision.outputs.domain
  endpoint: azureFunctionBotProvision.outputs.functionEndpoint
}

