import { prismaClient } from '@/configuration/prisma'
import type {
  InscritDuRecapitulatif,
  ListerLesLieux,
  RecapitulatifLu,
} from '../../domain/recapitulatif'
import { lireLesMediateursCoordonnes } from './mediateurs-coordonnes.query'

const getInscriptionDataContext = async <Lieu>({
  user,
  listerLesLieux,
}: {
  listerLesLieux: ListerLesLieux<Lieu>
  user: Pick<
    InscritDuRecapitulatif,
    'id' | 'mediateur' | 'coordinateur' | 'profilInscription'
  >
}) => {
  const [lieuxActivite, mediateursCoordonnes, userAdditionalData] =
    await Promise.all([
      // Get lieux activite if mediateur
      user.mediateur &&
      user.profilInscription !== 'Coordinateur' &&
      user.profilInscription !== 'CoordinateurConseillerNumerique'
        ? listerLesLieux({ mediateurId: user.mediateur.id })
        : [],
      // Get mediateurs coordonnes count if coordinateur
      user.coordinateur
        ? lireLesMediateursCoordonnes({
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
    lieuxActivite,
    mediateursCoordonnes,
    importedLieuxFromDataspace:
      userAdditionalData?.importedLieuxFromDataspace ?? null,
  }
}

export const lireLeRecapitulatif = async <Lieu>({
  user,
  listerLesLieux,
}: {
  user: InscritDuRecapitulatif
  listerLesLieux: ListerLesLieux<Lieu>
}): Promise<RecapitulatifLu<Lieu>> => {
  const { lieuxActivite, mediateursCoordonnes, importedLieuxFromDataspace } =
    await getInscriptionDataContext({ user, listerLesLieux })

  return {
    lieuxActivite,
    mediateursCoordonnesCount: mediateursCoordonnes?.length,
    importedLieuxFromDataspace,
  }
}
