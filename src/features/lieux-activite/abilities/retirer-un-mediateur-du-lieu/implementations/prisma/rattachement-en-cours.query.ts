import { prismaClient } from '@/configuration/prisma'
import { RattachementId } from '../../../../domain/identifiants/rattachement-id'
import type { TrouverLeRattachementEnCours } from '../../domain/ports'

export const trouverLeRattachementEnCours: TrouverLeRattachementEnCours =
  async ({ mediateurId, lieuId }) => {
    const rattachement = await prismaClient.mediateurEnActivite.findFirst({
      where: { mediateurId, structureId: lieuId, fin: null, suppression: null },
      select: {
        id: true,
        lieuInclusion: { select: { nom: true } },
        mediateur: {
          select: { user: { select: { email: true, firstName: true } } },
        },
      },
    })

    return rattachement == null
      ? null
      : {
          id: RattachementId(rattachement.id),
          nomDuLieu: rattachement.lieuInclusion.nom,
          emailDuMediateur: rattachement.mediateur.user.email,
          prenomDuMediateur: rattachement.mediateur.user.firstName,
        }
  }
