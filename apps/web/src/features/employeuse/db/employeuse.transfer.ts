import type { Prisma } from '@prisma/client'
import { AdresseEmployeuse } from '../domain/adresse-employeuse'
import type { Affectation } from '../domain/affectation'
import { ContactReferent } from '../domain/contact-referent'
import { type Contrat, contratPourEmployeuse } from '../domain/contrat'
import { DenominationEmployeuse } from '../domain/denomination-employeuse'
import type { Employeuse } from '../domain/employeuse'
import {
  type EmployeuseActuelle,
  employeuseActuelle,
} from '../domain/employeuse-actuelle'
import { EmployeuseId } from '../domain/employeuse-id'
import { PeriodeEmploi } from '../domain/periode-emploi'
import { Rna } from '../domain/rna'
import { Siret } from '../domain/siret'
import { SourceAffectation } from '../domain/source-affectation'

/**
 * Sélection Prisma des affectations actives d'une personne et de ses contrats.
 *
 * Elle est exposée parce qu'elle se **compose** : les lectures de liste
 * (session, annuaire admin, mon-réseau) l'imbriquent dans leur propre requête
 * sur `coop.users` plutôt que de déclencher une requête par utilisateur. C'est
 * le pendant Prisma du port SQL de la feature.
 */
export const personneEmployeuseSelect = {
  affectationsEmploi: {
    where: { estActive: true },
    select: {
      source: true,
      createdAt: true,
      structureAdministrative: {
        select: {
          id: true,
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

type AffectationRow = PersonneEmployeusePayload['affectationsEmploi'][number]
type EmployeuseRow = AffectationRow['structureAdministrative']
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
  siret: Siret.safe(row.siret ?? ''),
  rna: Rna.safe(row.rna ?? ''),
  adresse: toAdresse(row),
  contactReferent: ContactReferent(row.contact),
})

export const affectationToDomain = (row: AffectationRow): Affectation => ({
  employeuse: employeuseToDomain(row.structureAdministrative),
  source: SourceAffectation(row.source),
  depuis: row.createdAt,
})

const toContrat = (row: ContratRow, employeuseId: number): Contrat => ({
  employeuseId: EmployeuseId(employeuseId),
  periode: PeriodeEmploi({
    debut: row.dateDebut,
    fin: row.dateFin,
    rupture: row.dateRupture,
  }),
})

/**
 * Un contrat par employeuse (invariant de `Contrat`) : la base peut en porter
 * plusieurs pour une même structure, `contratPourEmployeuse` tranche ici, une
 * fois. Les contrats sans structure ne sont rattachables à aucune employeuse et
 * sont écartés.
 */
export const contratsToDomain = (rows: readonly ContratRow[]): Contrat[] => {
  const employeuseIds = [
    ...new Set(
      rows
        .map((row) => row.structureId)
        .filter((id): id is number => id !== null),
    ),
  ]

  return employeuseIds.flatMap((employeuseId) => {
    const contrat = contratPourEmployeuse(rows, employeuseId)
    return contrat ? [toContrat(contrat, employeuseId)] : []
  })
}

export const personneToAffectations = (
  personne: PersonneEmployeusePayload | null,
): Affectation[] =>
  (personne?.affectationsEmploi ?? []).map(affectationToDomain)

export const personneToContrats = (
  personne: PersonneEmployeusePayload | null,
): Contrat[] => contratsToDomain(personne?.contrats ?? [])

/**
 * Employeuse courante depuis une personne **déjà chargée**. C'est la voie des
 * lectures de liste, qui imbriquent `personneEmployeuseSelect` dans leur propre
 * requête ; la voie autonome (par `userId`) est l'ability
 * `consulter-employeuse-actuelle`.
 */
export const personneToEmployeuseActuelle = (
  personne: PersonneEmployeusePayload | null,
): EmployeuseActuelle | null =>
  employeuseActuelle(
    personneToAffectations(personne),
    personneToContrats(personne),
  )
