import type { DataspaceContrat } from '@app/web/external-apis/dataspace/dataspaceApiClient'

export type ContractStatus = {
  hasStarted: boolean
  hasEnded: boolean
  isRuptured: boolean
  isActive: boolean
  isTemporary: boolean
}

/**
 * Get the status of a contract relative to the current date
 *
 * - hasStarted: true if date_debut <= date
 * - hasEnded: true if date_fin exists and date_fin < date
 * - isRuptured: true if date_rupture exists and date_rupture < date
 * - isActive: true if started, not ended, and not ruptured
 * - isTemporary: true if date_debut is null
 */
export const getContractStatus = ({
  contrat,
  date = new Date(),
}: {
  contrat: DataspaceContrat
  date?: Date
}): ContractStatus => {
  const hasStarted = contrat.date_debut
    ? new Date(contrat.date_debut) <= date
    : false // a temp contract without date debut is considered as not started

  // null date_fin means CDI with no end date - contract is not ended
  const hasEnded = contrat.date_fin ? new Date(contrat.date_fin) < date : false

  // null date_rupture means contract was not terminated early
  const isRuptured = contrat.date_rupture
    ? new Date(contrat.date_rupture) < date
    : false

  const isActive = hasStarted && !hasEnded && !isRuptured

  return {
    hasStarted,
    hasEnded,
    isRuptured,
    isActive,
    isTemporary: contrat.date_debut === null,
  }
}
