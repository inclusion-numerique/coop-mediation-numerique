import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import type {
  DataspaceApiResult,
  DataspaceMediateur,
} from './dataspaceApiClient'
import {
  mockDataspaceApiError404,
  mockDataspaceMediateurConseillerNumerique,
  mockDataspaceMediateurCoordinateur,
  mockDataspaceMediateurCoordinateurHorsDispositif,
  mockDataspaceMediateurMinimal,
  mockDataspaceMediateurNonConseillerNumerique,
  mockDataspaceTestEmails,
} from './dataspaceApiClientMocks'

/**
 * Mock implementation of Dataspace API for e2e tests and local development
 *
 * Mock mode is enabled when ServerWebAppConfig.Dataspace.isMocked is true, which happens when:
 * - DATASPACE_API_MOCK=1 environment variable is set
 * - OR IS_E2E=true (automatically set for Cypress tests)
 *
 * When enabled, bypasses real API calls and returns predefined mock data based on email
 */

/**
 * In-memory mock database mapping emails to mediateur data
 * Add new email mappings here for your tests and fixtures
 */
const mockDataspaceDatabase: Record<string, DataspaceMediateur | null> = {
  // Test emails with predefined responses
  [mockDataspaceTestEmails.conseillerNumerique]:
    mockDataspaceMediateurConseillerNumerique,
  [mockDataspaceTestEmails.coordinateur]: mockDataspaceMediateurCoordinateur,
  [mockDataspaceTestEmails.mediateurNonCN]:
    mockDataspaceMediateurNonConseillerNumerique,

  // Additional test cases
  'coordinateur.horsdispositif@example.fr':
    mockDataspaceMediateurCoordinateurHorsDispositif,
  'mediateur.minimal@example.fr': mockDataspaceMediateurMinimal,

  // Fixture users (add your fixture user emails here)
  'conseiller.numerique.inscrit@example.fr':
    mockDataspaceMediateurConseillerNumerique,
}

/**
 * Mock implementation of getMediateurFromDataspaceApi
 * Simulates API behavior with instant responses
 */
export const getMediateurFromDataspaceApiMock = async ({
  email,
}: {
  email: string
}): Promise<DataspaceApiResult<DataspaceMediateur>> => {
  const normalizedEmail = email.toLowerCase().trim()

  // Simulate network delay (optional, useful for testing loading states)
  const simulateDelay = process.env.DATASPACE_API_MOCK_DELAY
  if (simulateDelay) {
    await new Promise((resolve) =>
      setTimeout(resolve, Number.parseInt(simulateDelay, 10)),
    )
  }

  // Check if email exists in mock database
  if (normalizedEmail in mockDataspaceDatabase) {
    const data = mockDataspaceDatabase[normalizedEmail]

    if (data === null) {
      // Explicitly mocked as not found
      return null
    }

    return data
  }

  // Default: not found (404)
  return null
}
