import { prismaClient } from '@/configuration/prisma/prismaClient'
import { employeuseActuelleAdaptee } from '@/features/inscription/acl/employeuse-actuelle.adapter'
import type { ProfilInscriptionValue } from '@/features/inscription/domain/profil-inscription'
import { stepPath } from '@/features/inscription/ui/step-path'
import {
  listerLesLieuxPourLInscription,
  MediateurId,
} from '@/features/lieux-activite'
import { getMediateursCoordonnesForInscription } from './getMediateursCoordonnesForInscription'

type InscritDuRecapitulatif = {
  readonly id: string
  readonly email: string
  readonly name: string | null
  readonly profilInscription: ProfilInscriptionValue | null
  readonly acceptationCgu: Date | null
  readonly isConseillerNumerique: boolean
  readonly mediateur: { readonly id: string } | null
  readonly coordinateur: { readonly id: string } | null
}

const getInscriptionDataContext = async ({
  user,
}: {
  user: Pick<
    InscritDuRecapitulatif,
    'id' | 'mediateur' | 'coordinateur' | 'profilInscription'
  >
}) => {
  const [emploi, lieuxActivite, mediateursCoordonnes, userAdditionalData] =
    await Promise.all([
      // Get structure employeuse
      employeuseActuelleAdaptee({
        userId: user.id,
      }),
      // Get lieux activite if mediateur
      user.mediateur &&
      user.profilInscription !== 'Coordinateur' &&
      user.profilInscription !== 'CoordinateurConseillerNumerique'
        ? listerLesLieuxPourLInscription({
            mediateurId: MediateurId(user.mediateur.id),
          })
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
  user: InscritDuRecapitulatif
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
