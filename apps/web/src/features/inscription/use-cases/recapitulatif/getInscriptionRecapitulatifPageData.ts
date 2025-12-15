import type { SessionUser } from '@app/web/auth/sessionUser'
import { getLieuxActiviteForInscription } from '@app/web/features/inscription/getLieuxActiviteForInscription'
import { getMediateursCoordonnesForInscription } from '@app/web/features/inscription/getMediateursCoordonnesForInscription'
import { getStructureEmployeuseForInscription } from '@app/web/features/inscription/getStructureEmployeuseForInscription'
import { getStepPath } from '@app/web/features/inscription/inscriptionFlow'
import { prismaClient } from '@app/web/prismaClient'

const getInscriptionDataContext = async ({
  user,
}: {
  user: Pick<
    SessionUser,
    'id' | 'mediateur' | 'coordinateur' | 'profilInscription'
  >
}) => {
  const [emploi, lieuxActivite, mediateursCoordonnes, userAdditionalData] =
    await Promise.all([
      // Get structure employeuse
      getStructureEmployeuseForInscription({
        userId: user.id,
      }),
      // Get lieux activite if mediateur
      user.mediateur &&
      user.profilInscription !== 'Coordinateur' &&
      user.profilInscription !== 'CoordinateurConseillerNumerique'
        ? getLieuxActiviteForInscription({ mediateurId: user.mediateur.id })
        : [],
      // Get mediateurs coordonnes count if coordinateur
      user.coordinateur
        ? getMediateursCoordonnesForInscription({
            userId: user.id,
          })
        : undefined,
      prismaClient.user.findUnique({
        where: { id: user.id },
        select: {
          importedLieuxFromDataspace: true,
        },
      }),
    ])

  return {
    emploi,
    lieuxActivite,
    mediateursCoordonnes,
    importedLieuxFromDataspace:
      userAdditionalData?.importedLieuxFromDataspace ?? null,
  }
}

export const getInscriptionRecapitulatifPageData = async ({
  user,
}: {
  user: Pick<
    SessionUser,
    | 'profilInscription'
    | 'id'
    | 'email'
    | 'name'
    | 'mediateur'
    | 'coordinateur'
    | 'acceptationCgu'
  >
}) => {
  const {
    emploi,
    lieuxActivite,
    mediateursCoordonnes,
    importedLieuxFromDataspace,
  } = await getInscriptionDataContext({ user })

  const mediateursCoordonnesCount = mediateursCoordonnes?.length

  // Determine back link based on role
  const backHref =
    user.profilInscription === 'ConseillerNumerique' &&
    importedLieuxFromDataspace // Hide backhref if lieux were imported from dataspace for conseiller numerique
      ? null
      : user.profilInscription === 'Coordinateur'
        ? getStepPath('choisir-role')
        : user.profilInscription === 'CoordinateurConseillerNumerique'
          ? null
          : getStepPath('lieux-activite')

  return {
    user,
    structureEmployeuse: emploi?.structure,
    lieuxActivite,
    mediateursCoordonnesCount,
    backHref,
    mustAcceptCgu: !user.acceptationCgu,
    canCancelInscription:
      user.profilInscription !== 'CoordinateurConseillerNumerique',
    conseillerNumeriqueRole:
      user.profilInscription === 'ConseillerNumerique'
        ? ('ConseillerNumerique' as const)
        : user.profilInscription === 'CoordinateurConseillerNumerique'
          ? ('CoordinateurConseillerNumerique' as const)
          : undefined,
    showConseillerNumeriqueSupportLink:
      user.profilInscription === 'CoordinateurConseillerNumerique',
    showInscriptionSteps:
      user.profilInscription === 'Mediateur' ||
      (user.profilInscription === 'ConseillerNumerique' &&
        !importedLieuxFromDataspace)
        ? 3
        : null,
  }
}

export type InscriptionRecapitulatifPageData = Awaited<
  ReturnType<typeof getInscriptionRecapitulatifPageData>
>
