/**
 * Dataspace API Integration Module
 *
 * This module provides functions to import and sync user data from the Dataspace API.
 * It replaces the MongoDB-based conseiller-numerique-v1 integration for signup flows.
 */

// API Client (re-export from external-apis)
export {
  getMediateurFromDataspaceApi,
  isDataspaceApiError,
  isDataspaceApiNotFound,
  type DataspaceMediateur,
  type DataspaceStructureEmployeuse,
  type DataspaceLieuActivite,
  type DataspaceConseillerNumeriqueCoordonne,
  type DataspaceApiResult,
} from '@app/web/external-apis/dataspace/dataspaceApiClient'

// Profile detection
export {
  getProfileFromDataspace,
  hasActiveContractFromDataspace,
} from './getProfileFromDataspace'

// Import functions
export { importMediateurFromDataspace } from './importMediateurFromDataspace'
export { importStructureEmployeuseFromDataspace } from './importStructureEmployeuseFromDataspace'
export { importLieuxActiviteFromDataspace } from './importLieuxActiviteFromDataspace'
export {
  importCoordonnesFromDataspace,
  importConseillersCooordonnesForCoordinateur,
} from './importCoordonnesFromDataspace'

// Signup flow functions
export { initializeAndImportUserDataFromDataspace } from './initializeAndImportUserDataFromDataspace'
export { updateUserInscriptionProfileFromDataspace } from './updateUserInscriptionProfileFromDataspace'

// Sync helper
export {
  syncUserFromDataspace,
  syncUsersFromDataspace,
  type SyncUserFromDataspaceResult,
} from './syncUserFromDataspace'

