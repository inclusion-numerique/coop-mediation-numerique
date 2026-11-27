import { prismaClient } from '@/configuration/prisma'
import {
  type LireLInscritARecapituler,
  MediateurId,
} from '@/features/inscription/abilities/consulter-le-recapitulatif/domain'
import { ProfilInscription } from '@/features/inscription/domain'

export const lireLInscritARecapituler: LireLInscritARecapituler = async (
  utilisateurId,
) => {
  const {
    profilInscription,
    mediateur,
    coordinateur,
    importedLieuxFromDataspace,
  } = await prismaClient.user.findUniqueOrThrow({
    where: { id: utilisateurId },
    select: {
      profilInscription: true,
      importedLieuxFromDataspace: true,
      mediateur: { select: { id: true } },
      coordinateur: { select: { id: true } },
    },
  })

  return {
    profil:
      profilInscription === null ? null : ProfilInscription(profilInscription),
    mediateurId: mediateur === null ? null : MediateurId(mediateur.id),
    aUnCompteCoordinateur: coordinateur !== null,
    lieuxImportesLe: importedLieuxFromDataspace,
  }
}
