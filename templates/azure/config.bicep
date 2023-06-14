@secure()
param provisionParameters object
param provisionOutputs object
// Get existing app settings and site config for merge
var functionCurrentConfigs = reference('${provisionOutputs.functionOutput.value.functionAppResourceId}/config/web', '2021-02-01')
var functionCurrentAppSettings = list('${provisionOutputs.functionOutput.value.functionAppResourceId}/config/appsettings', '2021-02-01').properties

// Merge TeamsFx configurations to Azure Functions resources
module teamsFxFunctionConfig './teamsFx/function.bicep' = {
  name: 'addTeamsFxFunctionConfiguration'
  params: {
    provisionParameters: provisionParameters
    provisionOutputs: provisionOutputs
    currentConfigs: functionCurrentConfigs
    currentAppSettings: functionCurrentAppSettings
  }
}

// Get existing app settings for merge
var functionBotCurrentConfigs = reference('${ provisionOutputs.azureFunctionBotOutput.value.functionAppResourceId }/config/web', '2021-02-01')
var functionBotCurrentAppSettings = list('${ provisionOutputs.azureFunctionBotOutput.value.functionAppResourceId }/config/appsettings', '2021-02-01').properties

// Merge TeamsFx configurations to Azure Function App
module teamsFxAzureFunctionBotConfig './teamsFx/azureFunctionBotConfig.bicep' = {
  name: 'teamsFxAzureFunctionBotConfig'
  params: {
    provisionParameters: provisionParameters
    provisionOutputs: provisionOutputs
    currentConfigs: functionBotCurrentConfigs
    currentAppSettings: functionBotCurrentAppSettings
  }
}
