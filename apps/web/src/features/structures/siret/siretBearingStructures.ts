import { getEmploisCountByCorrelation } from '@app/web/features/structures/correlateStructureAdministrative'
import { prismaClient } from '@app/web/prismaClient'

/**
 * Une structure porteuse d'un SIRET peut être un LIEU d'activité (`lieu_inclusion`,
 * SIRET optionnel) ou une STRUCTURE EMPLOYEUSE (`structure_administrative`, SIRET
 * obligatoire). Les deux tables sont indépendantes (corrélées par nom+adresse, sans FK).
 * Ce module offre une vue unifiée pour l'outillage SIRET (audit, dédup, normalisation).
 */
export type SiretSource = 'lieu' | 'employeuse'

// Id d'une structure porteuse de SIRET, typé par source. Les deux sont des `uuid` aujourd'hui ;
// à la bascule coop→main (ADR-002, étape 6) l'employeuse devient un `number`
// (`main.structure_administrative.id`). Isoler les deux ici rend l'étape 6 locale : il suffira de
// passer `EmployeuseSiretId` à `number` pour propager le changement à l'union et aux mutations.
type LieuSiretId = string
type EmployeuseSiretId = string

// Champs communs aux deux sources. Les champs « lieu-only » restent présents (et `null` pour une
// employeuse) parce que des consommateurs (audit / export SIRET) les sérialisent sans dispatcher
// sur `source` ; les disjoindre par branche élargirait inutilement le périmètre de l'étape 3.
type SiretBearingStructureBase = {
  siret: string
  nom: string
  adresse: string
  commune: string
  codePostal: string
  codeInsee: string | null
  synchronisationSiret: Date | null
  modification: Date
  // Contexte spécifique au LIEU (null pour une employeuse).
  telephone: string | null
  visibleCarto: boolean | null
  activitesCount: number | null
  mediateursCount: number | null
  // Emplois rattachés : corrélés (lieu) ou comptés directement (employeuse).
  emploisCount: number
}

/**
 * Une structure porteuse d'un SIRET est SOIT un lieu (`id` uuid), SOIT une employeuse
 * (`id` bientôt `number`). Union discriminée sur `source` pour que chaque `id` porte son propre
 * type — indispensable dès que l'id d'employeuse cessera d'être un uuid (ADR-002).
 */
type LieuSiretStructure = {
  source: 'lieu'
  id: LieuSiretId
} & SiretBearingStructureBase

type EmployeuseSiretStructure = {
  source: 'employeuse'
  id: EmployeuseSiretId
} & SiretBearingStructureBase

export type SiretBearingStructure =
  | LieuSiretStructure
  | EmployeuseSiretStructure

const siretFilter = {
  suppression: null,
  siret: { not: null },
  NOT: { siret: '' },
} as const

/** Vue unifiée des structures (lieu + employeuse) portant un SIRET renseigné. */
export const getSiretBearingStructures = async ({
  limit,
  sources = ['lieu', 'employeuse'],
}: {
  limit?: number
  sources?: SiretSource[]
} = {}): Promise<SiretBearingStructure[]> => {
  const lieux = sources.includes('lieu')
    ? await prismaClient.lieuInclusion.findMany({
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
    : []

  const employeuses = sources.includes('employeuse')
    ? await prismaClient.structureAdministrative.findMany({
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
          _count: { select: { emplois: true } },
        },
        orderBy: { siret: 'asc' },
        ...(limit ? { take: limit } : {}),
      })
    : []

  // Lieu : emplois de l'employeuse corrélée (nom+adresse+INSEE, pas de FK).
  const emploisByLieuId = await getEmploisCountByCorrelation(lieux, {
    activeOnly: false,
  })

  const lieuRows: SiretBearingStructure[] = lieux.map((lieu) => ({
    id: lieu.id,
    source: 'lieu',
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
    emploisCount: emploisByLieuId.get(lieu.id) ?? 0,
  }))

  const employeuseRows: SiretBearingStructure[] = employeuses.map(
    (employeuse) => ({
      id: employeuse.id,
      source: 'employeuse',
      siret: employeuse.siret as string,
      nom: employeuse.nom,
      adresse: employeuse.adresse,
      commune: employeuse.commune,
      codePostal: employeuse.codePostal,
      codeInsee: employeuse.codeInsee,
      synchronisationSiret: employeuse.synchronisationSiret,
      modification: employeuse.modification,
      // Concepts lieu absents de structure_administrative.
      telephone: null,
      visibleCarto: null,
      activitesCount: null,
      mediateursCount: null,
      // Emplois comptés directement (employes_structures.structure_id → SA).
      emploisCount: employeuse._count.emplois,
    }),
  )

  return [...lieuRows, ...employeuseRows]
}

/** Efface un SIRET erroné (et sa date de synchro) dans la bonne table selon la source. */
export const clearSiret = async ({
  id,
  source,
}: {
  id: LieuSiretId | EmployeuseSiretId
  source: SiretSource
}): Promise<void> => {
  const data = { siret: null, synchronisationSiret: null }
  await (source === 'lieu'
    ? prismaClient.lieuInclusion.update({ where: { id }, data })
    : prismaClient.structureAdministrative.update({ where: { id }, data }))
}

/** Marque un SIRET comme vérifié/synchronisé sans modifier l'identité. */
export const markSiretSynchronised = async ({
  id,
  source,
}: {
  id: LieuSiretId | EmployeuseSiretId
  source: SiretSource
}): Promise<void> => {
  const data = { synchronisationSiret: new Date() }
  await (source === 'lieu'
    ? prismaClient.lieuInclusion.update({ where: { id }, data })
    : prismaClient.structureAdministrative.update({ where: { id }, data }))
}

/** Aligne l'identité légale d'une EMPLOYEUSE sur les données SIRENE (API Entreprise). */
export const alignEmployeuseIdentity = async (
  id: EmployeuseSiretId,
  data: {
    nom: string
    adresse: string
    commune: string
    codePostal: string
    codeInsee: string
  },
): Promise<void> => {
  const now = new Date()
  await prismaClient.structureAdministrative.update({
    where: { id },
    data: { ...data, modification: now, synchronisationSiret: now },
  })
}
