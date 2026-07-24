import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'

// Écriture des affectations emploi `source='coop'` dans `main.personne_affectations_emploi` (dual-write,
// ADR-002 périmètre élargi 2026-07-23) : la coop pose `est_active` comme signal d'employeuse courante,
// en remplacement (à terme) de `coop.employes_structures`. Upsert idempotent sur la clé métier
// `(personne, structure, source)`.
//
// Accepte un client de transaction pour rester atomique avec l'écriture `employes_structures`.

const COOP_SOURCE = 'coop'

type PrismaLike = Prisma.TransactionClient

// Upsert d'une affectation coop : crée la ligne si absente, (ré)active/désactive selon `estActive`.
export const ensureAffectationEmploiMain = async (
  {
    personneId,
    structureAdministrativeId,
    estActive = true,
  }: {
    personneId: number
    structureAdministrativeId: number
    estActive?: boolean
  },
  prisma: PrismaLike = prismaClient,
): Promise<{ id: number }> =>
  prisma.personneAffectationEmploiMain.upsert({
    where: {
      personneId_structureAdministrativeId_source: {
        personneId,
        structureAdministrativeId,
        source: COOP_SOURCE,
      },
    },
    create: {
      personneId,
      structureAdministrativeId,
      source: COOP_SOURCE,
      estActive,
    },
    update: { estActive },
    select: { id: true },
  })

// Désactive (`est_active = false`) toutes les affectations coop de la personne SAUF celles conservées.
// Reflète la clôture des emplois `coop.employes_structures` (fin/suppression/changement d'employeuse).
export const deactivateCoopAffectationsExcept = async (
  {
    personneId,
    keepStructureAdministrativeIds,
  }: {
    personneId: number
    keepStructureAdministrativeIds: number[]
  },
  prisma: PrismaLike = prismaClient,
): Promise<void> => {
  await prisma.personneAffectationEmploiMain.updateMany({
    where: {
      personneId,
      source: COOP_SOURCE,
      estActive: true,
      structureAdministrativeId: { notIn: keepStructureAdministrativeIds },
    },
    data: { estActive: false },
  })
}
