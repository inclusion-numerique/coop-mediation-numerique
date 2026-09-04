import { prismaClient } from '@app/web/prismaClient'

/**
 * Outillage SIRET des LIEUX (`lieu_inclusion`) : audit, déduplication, normalisation.
 *
 * ADR-002 échange final : la source EMPLOYEUSE a été RETIRÉE de cet outillage. La qualité SIRET des
 * employeurs est désormais le job de l'Entrepôt (`main.structure_administrative`, possédée par Flyway) ;
 * la coop ne modifie plus les SIRET/identités d'employeurs (« juste consulter »). Cet outillage ne
 * couvre donc plus que les LIEUX, qui restent gérés par la coop.
 */
export type SiretSource = 'lieu'

type LieuSiretId = string

export type SiretBearingStructure = {
  source: 'lieu'
  id: LieuSiretId
  siret: string
  nom: string
  adresse: string
  commune: string
  codePostal: string
  codeInsee: string | null
  synchronisationSiret: Date | null
  modification: Date
  telephone: string | null
  visibleCarto: boolean | null
  activitesCount: number | null
  mediateursCount: number | null
}

const siretFilter = {
  suppression: null,
  siret: { not: null },
  NOT: { siret: '' },
} as const

/** Vue des LIEUX portant un SIRET renseigné. */
export const getSiretBearingStructures = async ({
  limit,
}: {
  limit?: number
} = {}): Promise<SiretBearingStructure[]> => {
  const lieux = await prismaClient.lieuInclusion.findMany({
    where: siretFilter,
    select: {
      id: true,
      siret: true,
      nom: true,
      adresse: true,
      commune: true,
      codePostal: true,
      codeInsee: true,
      synchronisationSiret: true,
      modification: true,
      telephone: true,
      visiblePourCartographieNationale: true,
      activitesCount: true,
      _count: { select: { mediateursEnActivite: true } },
    },
    orderBy: { siret: 'asc' },
    ...(limit ? { take: limit } : {}),
  })

  return lieux.map((lieu) => ({
    id: lieu.id,
    source: 'lieu' as const,
    siret: lieu.siret as string,
    nom: lieu.nom,
    adresse: lieu.adresse,
    commune: lieu.commune,
    codePostal: lieu.codePostal,
    codeInsee: lieu.codeInsee,
    synchronisationSiret: lieu.synchronisationSiret,
    modification: lieu.modification,
    telephone: lieu.telephone,
    visibleCarto: lieu.visiblePourCartographieNationale,
    activitesCount: lieu.activitesCount,
    mediateursCount: lieu._count.mediateursEnActivite,
  }))
}

/** Efface un SIRET erroné (et sa date de synchro) sur un LIEU. */
export const clearSiret = async ({
  id,
}: {
  id: LieuSiretId
}): Promise<void> => {
  await prismaClient.lieuInclusion.update({
    where: { id },
    data: { siret: null, synchronisationSiret: null },
  })
}

/** Marque un SIRET de LIEU comme vérifié/synchronisé sans modifier l'identité. */
export const markSiretSynchronised = async ({
  id,
}: {
  id: LieuSiretId
}): Promise<void> => {
  await prismaClient.lieuInclusion.update({
    where: { id },
    data: { synchronisationSiret: new Date() },
  })
}
