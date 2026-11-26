import { prismaClient } from '@/configuration/prisma'
import { LieuId } from '../../../../domain/identifiants/lieu-id'
import type { RattacherAuxLieux } from '../../domain/ports'
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

export const rattacherAuxLieux: RattacherAuxLieux = ({
  utilisateurId,
  lieux,
  structuresCarto,
  ajouteLe,
}) =>
  prismaClient.$transaction((transaction) =>
    enSerie(lieux, async (lieu) => {
      const { lieuId } = await rattacherAuLieu(transaction, {
        userId: utilisateurId,
        lieu,
        structuresCartoParId: structuresCarto,
        maintenant: ajouteLe,
      })

      return LieuId(lieuId)
    }),
  )
