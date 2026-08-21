import type { Prisma } from '@prisma/client'
import { AdresseEmployeuse } from '../domain/adresse-employeuse'
import { type Affectation, estConseillerNumerique } from '../domain/affectation'
import { ContactReferent } from '../domain/contact-referent'
import type { Contrat } from '../domain/contrat'
import { DenominationEmployeuse } from '../domain/denomination-employeuse'
import type { Employeuse } from '../domain/employeuse'
import { employeuseALaDate } from '../domain/employeuse-a-la-date'
import {
  type EmployeuseActuelle,
  employeuseActuelle,
} from '../domain/employeuse-actuelle'
import { EmployeuseId } from '../domain/employeuse-id'
import {
  type EmployeuseHistorique,
  employeusesHistorique,
} from '../domain/employeuses-historique'
import { PeriodeEmploi } from '../domain/periode-emploi'
import { Rna } from '../domain/rna'
import { Siret } from '../domain/siret'
import { SourceAffectation } from '../domain/source-affectation'

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

export const affectationToDomain = (row: AffectationRow): Affectation => ({
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

export const personneToAffectations = (
  personne: PersonneEmployeusePayload | null,
): Affectation[] =>
  (personne?.affectationsEmploi ?? []).map(affectationToDomain)

export const personneToContrats = (
  personne: PersonneEmployeusePayload | null,
  maintenant: Date = new Date(),
): Contrat[] => contratsToDomain(personne?.contrats ?? [], maintenant)

/**
 * Employeuse courante depuis une personne **déjà chargée**. C'est la voie des
 * lectures de liste, qui imbriquent `personneEmployeuseSelect` dans leur propre
 * requête ; la voie autonome (par `userId`) est l'ability
 * `consulter-employeuse-actuelle`.
 */
export const personneToEmployeuseActuelle = (
  personne: PersonneEmployeusePayload | null,
  maintenant: Date = new Date(),
): EmployeuseActuelle | null =>
  employeuseActuelle(
    personneToAffectations(personne),
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

/** Même composition, pour l'employeuse d'une date donnée. */
export const personneToEmployeuseALaDate = (
  personne: PersonneEmployeusePayload | null,
  date: Date,
  maintenant: Date = new Date(),
): Employeuse | null =>
  employeuseALaDate(
    personneToAffectations(personne),
    personneToContrats(personne, maintenant),
    date,
  )

/**
 * Sélection MINIMALE pour trancher le dispositif conseiller numérique : la règle ne regarde que la
 * source et l'état de l'affectation. Les lectures de liste l'imbriquent au lieu de
 * `personneEmployeuseSelect`, qui ramènerait structures et contrats pour rien.
 */
export const personneConseillerNumeriqueSelect = {
  affectationsEmploi: { select: { source: true, estActive: true } },
} satisfies Prisma.PersonneMainSelect

export type PersonneConseillerNumeriquePayload = Prisma.PersonneMainGetPayload<{
  select: typeof personneConseillerNumeriqueSelect
}>

/**
 * Dispositif conseiller numérique depuis une personne **déjà chargée**. Accepte aussi bien la
 * sélection minimale que `personneEmployeuseSelect` (plus riche) : la session, qui charge déjà la
 * seconde pour l'employeuse, ne paie donc aucune requête de plus.
 */
export const personneEstConseillerNumerique = (
  personne: PersonneConseillerNumeriquePayload | null,
): boolean =>
  estConseillerNumerique(
    (personne?.affectationsEmploi ?? []).map((affectation) => ({
      source: SourceAffectation(affectation.source),
      active: affectation.estActive,
    })),
  )

/**
 * Filtre Prisma « relève / ne relève pas du dispositif conseiller numérique », posé sur un
 * `coop.users`. Remplace la colonne `is_conseiller_numerique` dans les `where`.
 *
 * Le piège est le cas nul : un user SANS `main.personne` ne relève pas du dispositif et doit donc
 * apparaître dans le filtre « hors dispositif », faute de quoi il s'évanouirait des deux côtés — un
 * compte disparu d'un écran d'annuaire, sans la moindre erreur pour le signaler. C'est la raison
 * d'être de `conseiller-numerique-where.integration.ts`, qui épingle ce comportement.
 *
 * (`NOT { is }` et `isNot` ont été comparés en base : les deux incluent la relation nulle. Le choix
 * de `NOT` est donc de lisibilité, et c'est bien le test qui garantit la sémantique, pas la forme.)
 */
const affectationIdposteActive = {
  affectationsEmploi: { some: { source: 'idposte', estActive: true } },
} satisfies Prisma.PersonneMainWhereInput

export const conseillerNumeriqueWhere = (
  releveDuDispositif: boolean,
): Prisma.UserWhereInput =>
  releveDuDispositif
    ? { personneMain: { is: affectationIdposteActive } }
    : { NOT: { personneMain: { is: affectationIdposteActive } } }
