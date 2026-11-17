import { creerUnClientApi } from '@app/web/features/clients-api/abilities/creer-un-client-api'
import { modifierUnClientApi } from '@app/web/features/clients-api/abilities/modifier-un-client-api'
import {
  NomDuClientApi,
  type PorteeApi,
} from '@app/web/features/clients-api/domain'
import { prismaClient } from '@app/web/prismaClient'

export const testApiClientName = 'test-api-client'

export const testApiClient = {
  initialized: false,
  id: 'will-be-set-after-creation',
  name: testApiClientName,
  secret: 'will-be-set-after-creation',
}

const nom = NomDuClientApi(testApiClientName)

export const createTestApiClientWithScopes = async ({
  scopes,
}: {
  scopes: PorteeApi[]
}) => {
  const existingClient = await prismaClient.apiClient.findUnique({
    where: { name: testApiClientName },
  })

  if (existingClient && testApiClient.initialized) {
    await modifierUnClientApi({
      clientApiId: existingClient.id,
      definition: {
        nom,
        portees: scopes,
        validite: { debut: existingClient.validFrom, fin: null },
      },
    })
    return
  }

  if (existingClient) {
    await prismaClient.apiClient.delete({ where: { id: existingClient.id } })
  }

  const creation = await creerUnClientApi({
    nom,
    portees: scopes,
    validite: { debut: new Date(), fin: null },
  })

  if (!creation.success) throw new Error('Client API de test non créé')

  testApiClient.initialized = true
  testApiClient.id = creation.data.client.id
  testApiClient.secret = creation.data.secret
}
