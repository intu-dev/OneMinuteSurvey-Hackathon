@secure()
param provisionParameters object
var resourceBaseName = provisionParameters.resourceBaseName
var storageName = contains(provisionParameters, 'databaseStorageName') ? provisionParameters['databaseStorageName'] : '${resourceBaseName}db'
var storageSku = contains(provisionParameters, 'databaseStorageSku') ? provisionParameters['databaseStorageSku'] : 'Standard_LRS'

// Azure Storage hosting the survey database
resource storage 'Microsoft.Storage/storageAccounts@2021-06-01' = {
  kind: 'StorageV2'
  location: resourceGroup().location
  name: storageName
  properties: {
    supportsHttpsTrafficOnly: true
  }
  sku: {
    name: storageSku
  }
}

output resourceId string = storage.id
output connectionString string = 'DefaultEndpointsProtocol=https;AccountName=${storage.name};AccountKey=${listKeys(storage.id, storage.apiVersion).keys[0].value};EndpointSuffix=${environment().suffixes.storage}'
