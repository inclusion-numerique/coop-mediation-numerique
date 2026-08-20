import { prismaClient } from '@app/web/prismaClient'
import type { ProfilInscription } from '@prisma/client'

/**
 * Ce que le dispositif dit d'une personne, lu dans `main` au lieu d'être demandé à l'API Dataspace.
 *
 * `connue` remplace le « trouvé / pas trouvé dans l'API » qui pilotait les deux branches de
 * l'inscription : une personne absente de `main` est une personne que le dispositif ne connaît pas,
 * exactement comme un 404 de l'API auparavant.
 *
 * `main.*` est qualifié explicitement : le `search_path` (`coop,public`) ne l'inclut pas.
 */
export type DispositifPersonne = {
  readonly connue: boolean
  readonly estConseillerNumerique: boolean
  readonly estCoordinateur: boolean
}

const inconnue: DispositifPersonne = {
  connue: false,
  estConseillerNumerique: false,
  estCoordinateur: false,
}

type DispositifRow = {
  est_conseiller_numerique: boolean
  est_coordinateur: boolean
}

export const dispositifDepuisMain = async (
  userId: string,
): Promise<DispositifPersonne> => {
  const [row] = await prismaClient.$queryRaw<DispositifRow[]>`
    SELECT
      EXISTS (
        SELECT 1 FROM main.personne_affectations_emploi a
        WHERE a.personne_id = p.id AND a.source = 'idposte' AND a.est_active
      ) AS est_conseiller_numerique,
      COALESCE(p.is_coordinateur, false) AS est_coordinateur
    FROM main.personne p
    WHERE p.coop_id = ${userId}::uuid
    LIMIT 1`

  return row
    ? {
        connue: true,
        estConseillerNumerique: row.est_conseiller_numerique,
        estCoordinateur: row.est_coordinateur,
      }
    : inconnue
}

/**
 * Profil d'inscription déduit du dispositif — même table de décision qu'auparavant, sur des valeurs
 * dérivées plutôt que sur la réponse de l'API. `null` quand le dispositif ne connaît pas la
 * personne : c'est alors le parcours déclaratif qui choisit le rôle.
 */
export const profilDepuisDispositif = ({
  connue,
  estConseillerNumerique,
  estCoordinateur,
}: DispositifPersonne): ProfilInscription | null => {
  if (!connue) return null
  if (estCoordinateur && estConseillerNumerique)
    return 'CoordinateurConseillerNumerique'
  if (estCoordinateur) return 'Coordinateur'
  if (estConseillerNumerique) return 'ConseillerNumerique'
  return 'Mediateur'
}
