import {
  inscritDeLaListeSelect,
  inscritDeLaListeToDomain,
} from '@/features/utilisateurs/db/inscrit-de-la-liste.transfer'
import { inscritVivantWhere } from '@/features/utilisateurs/db/inscrit-vivant.where'
import { UtilisateurId } from '@/features/utilisateurs/domain'
import { prismaClient } from '@/prismaClient'
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
