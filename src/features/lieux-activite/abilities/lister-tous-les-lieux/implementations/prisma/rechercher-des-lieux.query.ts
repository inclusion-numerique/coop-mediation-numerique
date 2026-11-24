import { prismaClient } from '@/configuration/prisma/prisma-client'
import type { Prisma } from '@/generated/prisma/client'
import { motsDe } from '@/libraries/texte/mots'
import type { CriteresDeLaListe } from '../../domain/criteres-de-la-liste'
import type { PageDeLieux } from '../../domain/ligne-de-la-liste'
import { lieuxPourLaListe } from './lieux-pour-la-liste.query'
import { ordreDesLieux } from './tri-des-lieux.order-by'

const contient = (part: string) =>
  ({ contains: part, mode: 'insensitive' }) satisfies Prisma.StringFilter

const dansLesDeuxFiches = (part: string) => ({
  OR: [
    { nom: contient(part) },
    { siret: contient(part) },
    { adresse: contient(part) },
    { commune: contient(part) },
    { codePostal: contient(part) },
    { inscriptionRegistre: { nom: contient(part) } },
    { inscriptionRegistre: { adresse: { nomVoie: contient(part) } } },
    { inscriptionRegistre: { adresse: { nomCommune: contient(part) } } },
    { inscriptionRegistre: { adresse: { codePostal: contient(part) } } },
  ],
})

export const rechercherDesLieux = async (
  criteres: CriteresDeLaListe,
): Promise<PageDeLieux> => {
  const matchesWhere = {
    suppression: null,
    AND: motsDe(criteres.recherche).map(dansLesDeuxFiches),
  } satisfies Prisma.LieuInclusionWhereInput

  const structures = await lieuxPourLaListe({
    where: matchesWhere,
    take: criteres.pageSize,
    skip: (criteres.page - 1) * criteres.pageSize,
    orderBy: ordreDesLieux(criteres.tri),
  })

  const [matchesCount, totalCount] = await Promise.all([
    prismaClient.lieuInclusion.count({ where: matchesWhere }),
    prismaClient.lieuInclusion.count({ where: { suppression: null } }),
  ])

  return {
    totalCount,
    items: [...structures],
    totalItems: matchesCount,
    currentPage: criteres.page,
    pageSize: criteres.pageSize,
  }
}
