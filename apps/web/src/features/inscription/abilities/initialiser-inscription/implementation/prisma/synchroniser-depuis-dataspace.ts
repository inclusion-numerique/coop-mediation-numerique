import type { DataspaceMediateur } from '@app/web/external-apis/dataspace/dataspaceApiClient'
import {
  getMediateurFromDataspaceApi,
  isDataspaceApiError,
} from '@app/web/external-apis/dataspace/dataspaceApiClient'
import {
  importLieuxActiviteFromDataspace,
  syncFromDataspaceCore,
  upsertMediateur,
} from '@app/web/features/dataspace/syncFromDataspaceCore'
import { updateUserInscriptionProfileFromDataspace } from '@app/web/features/dataspace/updateUserInscriptionProfileFromDataspace'
import type { SynchroniserDepuisDataspace } from '@app/web/features/inscription/abilities/initialiser-inscription/domain'
import { prismaClient } from '@app/web/prismaClient'

/**
 * Import unique des lieux d'activité à l'inscription (fidèle au legacy) : crée
 * le médiateur si conseiller numérique (et non « coordinateur seul »), puis
 * importe les lieux Dataspace si le médiateur n'en a pas encore.
 */
const importerLieuxUneFois = async (
  userId: string,
  dataspaceData: DataspaceMediateur,
): Promise<void> => {
  const lieuxActivite = dataspaceData.lieux_activite ?? []
  const hasLieuxDansDataspace = lieuxActivite.length > 0

  const doitCreerMediateur =
    dataspaceData.is_conseiller_numerique &&
    (!dataspaceData.is_coordinateur || hasLieuxDansDataspace)

  if (!doitCreerMediateur) return

  const { mediateurId } = await upsertMediateur({ userId })

  if (!(dataspaceData.is_conseiller_numerique && hasLieuxDansDataspace)) return

  const existant = await prismaClient.mediateur.findUnique({
    where: { userId },
    select: {
      _count: {
        select: { enActivite: { where: { suppression: null, fin: null } } },
      },
    },
  })

  if (existant && existant._count.enActivite > 0) return

  await importLieuxActiviteFromDataspace({ mediateurId, lieuxActivite })
  await prismaClient.user.update({
    where: { id: userId },
    data: { importedLieuxFromDataspace: new Date() },
  })
}

export const synchroniserDepuisDataspace: SynchroniserDepuisDataspace = async ({
  userId,
  email,
}) => {
  const resultat = await getMediateurFromDataspaceApi({ email })

  if (isDataspaceApiError(resultat)) {
    // biome-ignore lint/suspicious/noConsole: observabilité d'erreur API, on poursuit en fallback
    console.error('Dataspace API error:', resultat.error.message)
    return null
  }

  if (!resultat) return null

  await updateUserInscriptionProfileFromDataspace({
    user: { id: userId },
    dataspaceData: resultat,
  })
  await syncFromDataspaceCore({
    userId,
    dataspaceData: resultat,
    wasConseillerNumerique: false,
  })
  await importerLieuxUneFois(userId, resultat)

  return { isConseillerNumerique: resultat.is_conseiller_numerique }
}
