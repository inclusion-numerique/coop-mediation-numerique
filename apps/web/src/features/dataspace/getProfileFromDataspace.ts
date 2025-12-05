import type { DataspaceMediateur } from '@app/web/external-apis/dataspace/dataspaceApiClient'
import type { ProfilInscription } from '@prisma/client'

/**
 * Determine the profile from Dataspace API response
 * Similar to getProfileInscriptionFromV1Data but using Dataspace fields
 * 
 * null means no profile found from dataspace
 */
export const getProfileFromDataspace = ({
  dataspaceData,
}: {
  dataspaceData: DataspaceMediateur | null
}): ProfilInscription | null => {
  if (!dataspaceData) {
    return null
  }

  // User is both coordinateur and conseiller numérique
  if (dataspaceData.is_coordinateur && dataspaceData.is_conseiller_numerique) {
    return 'CoordinateurConseillerNumerique'
  }

  // User is only coordinateur (coordinating conseillers numériques)
  if (dataspaceData.is_coordinateur) {
    return 'CoordinateurConseillerNumerique'
  }

  // User is conseiller numérique
  if (dataspaceData.is_conseiller_numerique) {
    return 'ConseillerNumerique'
  }

  // Not found in Dataspace or not a conseiller/coordinateur
  return 'Mediateur'
}

/**
 * Check if the Dataspace data indicates an active conseiller numérique
 * (has at least one structure employeuse with active contract)
 */
export const hasActiveContractFromDataspace = (
  dataspaceData: DataspaceMediateur | null,
): boolean => {
  if (!dataspaceData) {
    return false
  }

  const now = new Date()

  // Check if any structure has an active contract (date_debut <= now <= date_fin, no date_rupture)
  return dataspaceData.structures_employeuses.some((structure) =>
    structure.contrats.some((contrat) => {
      const dateDebut = new Date(contrat.date_debut)
      const dateFin = new Date(contrat.date_fin)
      const hasNotStarted = dateDebut > now
      const hasEnded = dateFin < now
      const isRuptured = contrat.date_rupture !== null

      return !hasNotStarted && !hasEnded && !isRuptured
    }),
  )
}

