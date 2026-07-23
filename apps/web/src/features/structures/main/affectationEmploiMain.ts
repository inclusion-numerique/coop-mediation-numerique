import { referentFromMainContact } from '@app/web/features/structures/main/mainContact'
import type { Prisma } from '@prisma/client'

// Résolution de l'employeuse COURANTE d'une personne depuis `main` (ADR-002, périmètre élargi
// 2026-07-23) : on lit `main.personne_affectations_emploi` (`est_active`) au lieu de
// `coop.employes_structures`, on choisit la source **prioritaire**, et les dates d'emploi viennent de
// `main.contrat` en best-effort (jointure personne + structure).

// Priorité de source : `idposte` fait autorité (dispositif CN), sinon le déclaratif `coop`, sinon le
// reste. Décision Marc du 2026-07-23.
const SOURCE_PRIORITY: Record<string, number> = { idposte: 0, coop: 1 }
const sourceRank = (source: string): number => SOURCE_PRIORITY[source] ?? 2

// Sélection sur `main.personne` : ses affectations actives (+ la structure et son adresse) et ses
// contrats (dates). On rapproche affectation ↔ contrat par `structureId` côté application.
export const personneEmployeuseSelect = {
  affectationsEmploi: {
    where: { estActive: true },
    select: {
      source: true,
      createdAt: true,
      structureAdministrative: {
        select: {
          id: true,
          structureCoopId: true,
          denominationSirene: true,
          denominationAntenne: true,
          siret: true,
          rna: true,
          contact: true,
          adresse: {
            select: {
              numeroVoie: true,
              repetition: true,
              nomVoie: true,
              codePostal: true,
              codeInsee: true,
              nomCommune: true,
            },
          },
        },
      },
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

export type PersonneEmployeusePayload = Prisma.PersonneMainGetPayload<{
  select: typeof personneEmployeuseSelect
}>

type Affectation = PersonneEmployeusePayload['affectationsEmploi'][number]
type Contrat = PersonneEmployeusePayload['contrats'][number]

// Employeuse courante = affectation active de source la plus prioritaire ; à priorité égale, la plus
// récemment créée. `null` si aucune affectation active.
export const pickAffectationActuelle = (
  affectations: Affectation[],
): Affectation | null =>
  affectations
    .toSorted((a, b) => {
      const bySource = sourceRank(a.source) - sourceRank(b.source)
      if (bySource !== 0) return bySource
      return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
    })
    .at(0) ?? null

// Contrat le plus pertinent pour une structure : celui qui la cible, en préférant une date de début
// renseignée puis la plus récente. `main.contrat` ne couvre pas tout le monde -> best-effort.
export const pickContratForStructure = (
  contrats: Contrat[],
  structureId: number,
): Contrat | null =>
  contrats
    .filter((contrat) => contrat.structureId === structureId)
    .toSorted(
      (a, b) => (b.dateDebut?.getTime() ?? 0) - (a.dateDebut?.getTime() ?? 0),
    )
    .at(0) ?? null

const adresseLigne = (
  adresse: Affectation['structureAdministrative']['adresse'],
): string => {
  if (!adresse) return ''
  return [adresse.numeroVoie, adresse.repetition, adresse.nomVoie]
    .filter((part) => part !== null && part !== undefined && `${part}` !== '')
    .join(' ')
}

// Forme normalisée de l'employeuse courante, exposée aux lectures coop. Porte l'id main (int) ET le
// `structureCoopId` (uuid) pour le dual-write pendant la transition, et les dates best-effort.
export type EmployeuseActuelle = {
  structureMainId: number
  structureCoopId: string | null
  source: string
  nom: string
  adresse: string
  commune: string
  codePostal: string
  codeInsee: string | null
  siret: string | null
  rna: string | null
  nomReferent: string | null
  courrielReferent: string | null
  telephoneReferent: string | null
  debut: Date | null
  fin: Date | null
}

export const resolveEmployeuseActuelle = (
  personne: PersonneEmployeusePayload | null,
): EmployeuseActuelle | null => {
  const affectation = personne
    ? pickAffectationActuelle(personne.affectationsEmploi)
    : null
  if (!personne || !affectation) return null

  const structure = affectation.structureAdministrative
  const contrat = pickContratForStructure(personne.contrats, structure.id)
  const adresse = structure.adresse

  return {
    structureMainId: structure.id,
    structureCoopId: structure.structureCoopId,
    source: affectation.source,
    nom: structure.denominationAntenne ?? structure.denominationSirene ?? '',
    adresse: adresseLigne(adresse),
    commune: adresse?.nomCommune ?? '',
    codePostal: adresse?.codePostal ?? '',
    codeInsee: adresse?.codeInsee ?? null,
    siret: structure.siret ?? null,
    rna: structure.rna ?? null,
    ...referentFromMainContact(structure.contact),
    debut: contrat?.dateDebut ?? null,
    fin: contrat?.dateFin ?? contrat?.dateRupture ?? null,
  }
}
