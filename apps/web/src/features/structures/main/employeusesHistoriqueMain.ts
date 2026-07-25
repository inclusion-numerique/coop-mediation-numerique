import { pickContratForStructure } from '@app/web/features/structures/main/affectationEmploiMain'
import {
  employeuseMainAdminSelect,
  employeuseMainToAdminStructure,
} from '@app/web/features/structures/main/employeuseLieuData'
import type { Prisma } from '@prisma/client'

// Historique des employeuses d'une personne pour l'affichage ADMIN, lu en PUR MAIN (ADR-002 périmètre
// élargi) : une entrée par structure à laquelle la personne est/a été affectée (`main.personne_
// affectations_emploi`, TOUTES sources et états), dédupliquée. `est_active` distingue « en cours » de
// « terminé » (l'ancien soft-delete coop est abandonné). Les dates viennent de `main.contrat`
// (best-effort : renseignées pour les CN, `null` pour les non-CN dont les dates n'ont pas de sens).

export const personneEmployeusesHistoriqueSelect = {
  affectationsEmploi: {
    select: {
      estActive: true,
      createdAt: true,
      structureAdministrative: { select: employeuseMainAdminSelect },
    },
  },
  contrats: {
    select: {
      structureId: true,
      dateDebut: true,
      dateFin: true,
      dateRupture: true,
    },
  },
} satisfies Prisma.PersonneMainSelect

type PersonneHistoriquePayload = Prisma.PersonneMainGetPayload<{
  select: typeof personneEmployeusesHistoriqueSelect
}>

type Affectation = PersonneHistoriquePayload['affectationsEmploi'][number]

export type EmployeuseHistorique = {
  // uuid coop si présent (lien de route admin), sinon l'id main stringifié.
  id: string
  estActive: boolean
  debut: Date | null
  fin: Date | null
  creation: Date | null
  structure: ReturnType<typeof employeuseMainToAdminStructure>
}

const premiereDate = (dates: (Date | null)[]): Date | null =>
  dates
    .filter((date): date is Date => date !== null)
    .toSorted((a, b) => a.getTime() - b.getTime())
    .at(0) ?? null

export const resolveEmployeusesHistorique = (
  personne: PersonneHistoriquePayload | null,
): EmployeuseHistorique[] => {
  if (!personne) return []

  const affectations = personne.affectationsEmploi
  // Une entrée par structure (dédup : une personne peut avoir 2 affectations idposte+coop sur la même).
  const structures = [
    ...new Map(
      affectations.map((affectation) => [
        affectation.structureAdministrative.id,
        affectation.structureAdministrative,
      ]),
    ).values(),
  ]

  return structures.map((structure) => {
    const affectationsStructure = affectations.filter(
      (affectation: Affectation) =>
        affectation.structureAdministrative.id === structure.id,
    )
    const contrat = pickContratForStructure(personne.contrats, structure.id)
    // ADR-002 échange final : la route admin `/structures-employeuses/[id]` lit main -> l'id est
    // l'entier main stringifié (plus l'uuid coop).
    const id = String(structure.id)

    return {
      id,
      estActive: affectationsStructure.some(
        (affectation) => affectation.estActive,
      ),
      debut: contrat?.dateDebut ?? null,
      fin: contrat?.dateFin ?? contrat?.dateRupture ?? null,
      creation: premiereDate(
        affectationsStructure.map((affectation) => affectation.createdAt),
      ),
      structure: employeuseMainToAdminStructure(id, structure),
    }
  })
}
