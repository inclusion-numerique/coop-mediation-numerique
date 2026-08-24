import type { SessionUser } from '@app/web/auth/sessionUser'
import { getLieuxActiviteForInscription } from '@app/web/features/inscription/getLieuxActiviteForInscription'
import { getStructureEmployeuseForInscription } from '@app/web/features/inscription/getStructureEmployeuseForInscription'
import { stepPath } from '@app/web/features/inscription/ui/step-path'
import { prismaClient } from '@app/web/prismaClient'
import { getMediateursCoordonnesForInscription } from './getMediateursCoordonnesForInscription'

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

export const getRecapitulatifPageData = async ({
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
    | 'isConseillerNumerique'
  >
}) => {
  const {
    emploi,
    lieuxActivite,
    mediateursCoordonnes,
    importedLieuxFromDataspace,
  } = await getInscriptionDataContext({ user })

  const mediateursCoordonnesCount = mediateursCoordonnes?.length

  // « Précédent » mène à l'étape des lieux dès qu'elle concerne l'utilisateur,
  // c'est-à-dire dès qu'il est médiateur — y compris quand le parcours l'a sautée
  // parce que le Dataspace avait déjà importé ses lieux : il peut ainsi les revoir
  // avant de valider. Un coordinateur sans médiation revient à son choix de rôle.
  // Reste sans précédent le coordinateur conseiller numérique sans lieu : l'étape
  // ne le concerne pas, et il a rejoint le récapitulatif directement.
  const backHref = user.mediateur
    ? stepPath('lieux-activite')
    : user.profilInscription === 'Coordinateur'
      ? stepPath('choisir-role')
      : null

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

export type RecapitulatifPageData = Awaited<
  ReturnType<typeof getRecapitulatifPageData>
>
