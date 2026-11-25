import type { Prisma } from '@/generated/prisma/client'
import { Siret } from '@/libraries/insee'
import { AdresseEmployeuse } from '../../domain/adresse-employeuse'
import type { Affectation } from '../../domain/affectation/affectation'
import type { Contrat } from '../../domain/affectation/contrat'
import { PeriodeEmploi } from '../../domain/affectation/periode-emploi'
import { SourceAffectation } from '../../domain/affectation/source-affectation'
import { employeuseALaDate } from '../../domain/consultation/employeuse-a-la-date'
import {
  type AffectationActuelle,
  type EmployeuseActuelle,
  employeuseActuelle,
} from '../../domain/consultation/employeuse-actuelle'
import {
  type EmployeuseHistorique,
  employeusesHistorique,
} from '../../domain/consultation/employeuses-historique'
import { ContactReferent } from '../../domain/contact-referent'
import { DenominationEmployeuse } from '../../domain/denomination-employeuse'
import type { Employeuse } from '../../domain/employeuse'
import { EmployeuseId } from '../../domain/employeuse-id'
import { Rna } from '../../domain/rna'

/** Colonnes de `main.structure_administrative` dont le domaine a besoin. */
export const employeuseSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
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
} satisfies Prisma.StructureAdministrativeMainSelect

/**
 * Sélection Prisma des affectations actives d'une personne et de ses contrats.
 *
 * Elle est exposée parce qu'elle se **compose** : les lectures de liste
 * (session, annuaire admin, mon-réseau) l'imbriquent dans leur propre requête
 * sur `coop.users` plutôt que de déclencher une requête par utilisateur. C'est
 * le pendant Prisma du port SQL de la feature.
 */
export const personneEmployeuseSelect = {
  // Toutes les affectations, actives ou non : les passées portent l'historique,
  // et c'est le domaine qui décide lesquelles désignent l'employeuse courante.
  affectationsEmploi: {
    select: {
      source: true,
      estActive: true,
      createdAt: true,
      structureAdministrative: { select: employeuseSelect },
    },
  },
  // Les contrats portent leur employeuse : un contrat passé désigne souvent une
  // structure absente des affectations actives, et c'est elle qu'il faut rendre
  // pour une date révolue.
  contrats: {
    select: {
      dateDebut: true,
      dateFin: true,
      dateRupture: true,
      structureAdministrative: { select: employeuseSelect },
    },
  },
} satisfies Prisma.PersonneMainSelect

export type PersonneEmployeusePayload = Prisma.PersonneMainGetPayload<{
  select: typeof personneEmployeuseSelect
}>

export const personneEmployeuseActuelleSelect = {
  employeuseActuelle: {
    select: {
      source: true,
      structureAdministrative: { select: employeuseSelect },
    },
  },
  contrats: personneEmployeuseSelect.contrats,
} satisfies Prisma.PersonneMainSelect

export type PersonneEmployeuseActuellePayload = Prisma.PersonneMainGetPayload<{
  select: typeof personneEmployeuseActuelleSelect
}>

type AffectationRow = PersonneEmployeusePayload['affectationsEmploi'][number]

export type EmployeuseRow = Prisma.StructureAdministrativeMainGetPayload<{
  select: typeof employeuseSelect
}>
type ContratRow = PersonneEmployeusePayload['contrats'][number]

const voie = (adresse: EmployeuseRow['adresse']): string | null =>
  [adresse?.numeroVoie, adresse?.repetition, adresse?.nomVoie]
    .filter((part) => part !== null && part !== undefined && `${part}` !== '')
    .join(' ') || null

/**
 * L'adresse n'existe que si `main.adresse` répond : ses trois colonnes
 * structurantes (code postal, code INSEE, commune) sont NOT NULL, donc une
 * ligne présente est une adresse complète. La forme totale couvre le cas
 * résiduel d'un code INSEE hors format.
 */
const toAdresse = (row: EmployeuseRow): AdresseEmployeuse | null =>
  row.adresse
    ? AdresseEmployeuse.safe({
        voie: voie(row.adresse),
        codePostal: row.adresse.codePostal,
        codeInsee: row.adresse.codeInsee,
        commune: row.adresse.nomCommune,
      })
    : null

export const employeuseToDomain = (row: EmployeuseRow): Employeuse => ({
  id: EmployeuseId(row.id),
  // L'antenne prime sur SIRENE : c'est le nom local, celui que les équipes
  // reconnaissent. Les deux peuvent manquer (entreprises individuelles).
  denomination:
    DenominationEmployeuse.safe(row.denominationAntenne ?? '') ??
    DenominationEmployeuse.safe(row.denominationSirene ?? ''),
  denominationSirene: DenominationEmployeuse.safe(row.denominationSirene ?? ''),
  siret: Siret.safe(row.siret ?? ''),
  rna: Rna.safe(row.rna ?? ''),
  adresse: toAdresse(row),
  contactReferent: ContactReferent(row.contact),
  creation: row.createdAt,
  modification: row.updatedAt ?? row.createdAt,
  suppression: row.deletedAt,
})

const affectationToDomain = (row: AffectationRow): Affectation => ({
  employeuse: employeuseToDomain(row.structureAdministrative),
  source: SourceAffectation(row.source),
  active: row.estActive,
  depuis: row.createdAt,
})

/**
 * Tous les contrats, dans l'ordre de la base. On ne déduplique pas par
 * employeuse : deux contrats successifs chez le même employeur restent deux
 * périodes distinctes, et c'est ce qui permet de savoir laquelle couvre une
 * date. Les contrats sans structure ne sont rattachables à aucune employeuse et
 * sont écartés.
 */
export const contratsToDomain = (
  rows: readonly ContratRow[],
  // Horloge du transfer : le domaine, lui, l'exige. Un contrat n'est terminé que
  // si son terme est passé, et cette lecture est donc datée.
  maintenant: Date = new Date(),
): Contrat[] =>
  rows.flatMap((row) =>
    row.structureAdministrative
      ? [
          {
            employeuse: employeuseToDomain(row.structureAdministrative),
            periode: PeriodeEmploi({
              debut: row.dateDebut,
              fin: row.dateFin,
              rupture: row.dateRupture,
              maintenant,
            }),
          },
        ]
      : [],
  )

const personneToAffectations = (
  personne: PersonneEmployeusePayload | null,
): Affectation[] =>
  (personne?.affectationsEmploi ?? []).map(affectationToDomain)

const personneToContrats = (
  personne: { readonly contrats: readonly ContratRow[] } | null,
  maintenant: Date = new Date(),
): Contrat[] => contratsToDomain(personne?.contrats ?? [], maintenant)

const affectationActuelleToDomain = (
  personne: PersonneEmployeuseActuellePayload | null,
): AffectationActuelle | null =>
  personne?.employeuseActuelle
    ? {
        employeuse: employeuseToDomain(
          personne.employeuseActuelle.structureAdministrative,
        ),
        source: SourceAffectation(personne.employeuseActuelle.source),
      }
    : null

export const personneToEmployeuseActuelle = (
  personne: PersonneEmployeuseActuellePayload | null,
  maintenant: Date = new Date(),
): EmployeuseActuelle | null =>
  employeuseActuelle(
    affectationActuelleToDomain(personne),
    personneToContrats(personne, maintenant),
  )

/** Même composition, pour l'historique complet des employeuses. */
export const personneToEmployeusesHistorique = (
  personne: PersonneEmployeusePayload | null,
  maintenant: Date = new Date(),
): EmployeuseHistorique[] =>
  employeusesHistorique(
    personneToAffectations(personne),
    personneToContrats(personne, maintenant),
  )

export const personneToEmployeuseALaDate = (
  personne: PersonneEmployeuseActuellePayload | null,
  date: Date,
  maintenant: Date = new Date(),
): Employeuse | null =>
  employeuseALaDate(
    affectationActuelleToDomain(personne)?.employeuse ?? null,
    personneToContrats(personne, maintenant),
    date,
  )
