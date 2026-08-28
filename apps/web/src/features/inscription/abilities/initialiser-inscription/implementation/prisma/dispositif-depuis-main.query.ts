import {
  type DispositifPersonne,
  dispositifInconnu,
} from '@app/web/features/inscription/domain'
import { prismaClient } from '@app/web/prismaClient'

type DispositifRow = {
  est_conseiller_numerique: boolean
  est_coordinateur: boolean
}

/**
 * Ce que le dispositif dit d'une personne, lu dans `main` au lieu d'être demandé
 * à l'API Dataspace : « connue du dispositif » y remplace « trouvée dans l'API ».
 *
 * `main.*` est qualifié explicitement : le `search_path` (`coop,public`) ne
 * l'inclut pas.
 */
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
    : dispositifInconnu
}
