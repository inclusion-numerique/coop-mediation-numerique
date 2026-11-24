import { prismaClient } from '@/configuration/prisma/prisma-client'
import { type Result, success } from '@/libraries/result'
import { LieuId } from '../../../../domain/identifiants/lieu-id'
import type { MediateurId } from '../../../../domain/identifiants/mediateur-id'
import type { UtilisateurId } from '../../../../domain/identifiants/utilisateur-id'
import {
  type AjouterDesLieuxActivitePorts,
  demandeDAjout,
  type EchecDAjout,
  identifiantsCarto,
  type LieuDemande,
  lieuxAMaterialiser,
} from '../../domain'
import { rattacherAuLieu } from './rattacher-au-lieu.mutation'

const enSerie = async <Element, Resultat>(
  elements: readonly Element[],
  traiter: (element: Element) => Promise<Resultat>,
): Promise<readonly Resultat[]> =>
  elements.reduce<Promise<readonly Resultat[]>>(
    async (precedents, element) => [
      ...(await precedents),
      await traiter(element),
    ],
    Promise.resolve([]),
  )

export const ajouterDesLieuxActivite = async ({
  demandes,
  userId,
  mediateurId,
  ports,
  maintenant = new Date(),
}: {
  readonly demandes: readonly LieuDemande[]
  readonly userId: UtilisateurId
  readonly mediateurId: MediateurId | null
  readonly ports: AjouterDesLieuxActivitePorts
  readonly maintenant?: Date
}): Promise<Result<{ readonly lieux: readonly LieuId[] }, EchecDAjout>> => {
  const demande = demandeDAjout({ mediateurId, demandes })

  if (!demande.success) return demande

  const aMaterialiser = lieuxAMaterialiser(
    await ports.lireLieuxDejaRattaches(demande.data.mediateurId),
    demande.data.demandes,
  )

  if (aMaterialiser.length === 0) return success({ lieux: [] })

  const structuresCartoParId = await ports.trouverStructuresCarto(
    identifiantsCarto(aMaterialiser),
  )

  const lieux = await prismaClient.$transaction((transaction) =>
    enSerie(aMaterialiser, async (lieu) => {
      const { lieuId } = await rattacherAuLieu(transaction, {
        userId,
        lieu,
        structuresCartoParId,
        maintenant,
      })

      return LieuId(lieuId)
    }),
  )

  return success({ lieux })
}
