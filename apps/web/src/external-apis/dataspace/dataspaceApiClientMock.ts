import { conseillerInscriptionEmail } from '@app/fixtures/users/conseillerInscription'
import { conseillerInscriptionSansContratEmail } from '@app/fixtures/users/conseillerInscriptionSansContrat'
import { conseillerSansLieuInscriptionEmail } from '@app/fixtures/users/conseillerSansLieuInscription'
import { coordinateurHorsDispositifInscriptionEmail } from '@app/fixtures/users/coordinateurHorsDispositifInscription'
import { coordinateurInscriptionEmail } from '@app/fixtures/users/coordinateurInscription'
import { coordinateurInscriptionAvecToutEmail } from '@app/fixtures/users/coordinateurInscriptionAvecTout'
import { mediateurInscriptionEmail } from '@app/fixtures/users/mediateurInscription'
import type {
  DataspaceApiResult,
  DataspaceMediateur,
} from './dataspaceApiClient'
import {
  mockDataspaceConseillerNumeriqueInscription,
  mockDataspaceConseillerNumeriqueSansContratInscription,
  mockDataspaceConseillerSansLieuInscription,
  mockDataspaceCoordinateurConumInscription,
  mockDataspaceCoordinateurConumInscriptionAvecTout,
  mockDataspaceCoordinateurHorsDispositifInscription,
  mockDataspaceMediateurInscription,
} from './dataspaceApiClientMockData'

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
 * Original mock database - used to reset after tests
 */
const originalMockDataspaceDatabase: Record<string, DataspaceMediateur | null> =
  {
    [conseillerInscriptionEmail]: mockDataspaceConseillerNumeriqueInscription,
    [conseillerInscriptionSansContratEmail]:
      mockDataspaceConseillerNumeriqueSansContratInscription,
    [coordinateurHorsDispositifInscriptionEmail]:
      mockDataspaceCoordinateurHorsDispositifInscription,
    [coordinateurInscriptionEmail]: mockDataspaceCoordinateurConumInscription,
    [coordinateurInscriptionAvecToutEmail]:
      mockDataspaceCoordinateurConumInscriptionAvecTout,
    [mediateurInscriptionEmail]: mockDataspaceMediateurInscription,
    [conseillerSansLieuInscriptionEmail]:
      mockDataspaceConseillerSansLieuInscription,
  }

/**
 * In-memory mock database mapping emails to mediateur data
 * Add new email mappings here for your tests and fixtures
 * This is mutable for testing purposes - use setMockDataspaceData to modify
 */
export const mockDataspaceDatabase: Record<string, DataspaceMediateur | null> =
  { ...originalMockDataspaceDatabase }

/**
 * Set mock data for a specific email in the mock database
 * Useful for integration tests to simulate different Dataspace scenarios
 *
 * @param email - The email to set mock data for
 * @param data - The mock data to return for this email (null = not found)
 */
export const setMockDataspaceData = (
  email: string,
  data: DataspaceMediateur | null,
): void => {
  mockDataspaceDatabase[email.toLowerCase().trim()] = data
}

/**
 * Remove mock data for a specific email from the mock database
 * After removal, queries for this email will return null (not found)
 *
 * @param email - The email to remove from mock database
 */
export const removeMockDataspaceData = (email: string): void => {
  const normalizedEmail = email.toLowerCase().trim()
  delete mockDataspaceDatabase[normalizedEmail]
}

/**
 * Reset the mock database to its original state
 * Should be called in afterEach/afterAll to clean up test modifications
 */
export const resetMockDataspaceDatabase = (): void => {
  // Clear all current entries
  for (const key of Object.keys(mockDataspaceDatabase)) {
    delete mockDataspaceDatabase[key]
  }
  // Restore original entries
  Object.assign(mockDataspaceDatabase, originalMockDataspaceDatabase)
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
