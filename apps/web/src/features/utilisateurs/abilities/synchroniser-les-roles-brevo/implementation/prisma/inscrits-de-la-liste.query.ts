import {
  inscritDeLaListeSelect,
  inscritDeLaListeToDomain,
} from '@app/web/features/utilisateurs/db/inscrit-de-la-liste.transfer'
import { inscritVivantWhere } from '@app/web/features/utilisateurs/db/inscrit-vivant.where'
import { UtilisateurId } from '@app/web/features/utilisateurs/domain'
import { prismaClient } from '@app/web/prismaClient'
import type { LectureDesInscrits } from '../../domain'

export const inscritsDeLaListe = async (): Promise<LectureDesInscrits> => {
  const lignes = await prismaClient.user.findMany({
    relationLoadStrategy: 'join',
    where: inscritVivantWhere,
    select: inscritDeLaListeSelect,
    orderBy: { id: 'asc' },
  })

  return lignes.reduce<LectureDesInscrits>(
    (lecture, ligne) => {
      const inscrit = inscritDeLaListeToDomain(ligne)
      return inscrit === null
        ? {
            ...lecture,
            illisibles: [...lecture.illisibles, UtilisateurId(ligne.id)],
          }
        : { ...lecture, inscrits: [...lecture.inscrits, inscrit] }
    },
    { inscrits: [], illisibles: [] },
  )
}
