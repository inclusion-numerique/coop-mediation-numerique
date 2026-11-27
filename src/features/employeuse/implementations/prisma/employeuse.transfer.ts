import type { Prisma } from '@/generated/prisma/client'
import { Siret } from '@/libraries/insee'
import { AdresseEmployeuse } from '../../domain/adresse-employeuse'
import type { Affectation } from '../../domain/affectation/affectation'
import { SourceAffectation } from '../../domain/affectation/source-affectation'
import type {
  ContratLu,
  EmploiActuelLu,
  HistoriqueDEmploiLu,
} from '../../domain/consultation/emploi-lu'
import type { AffectationActuelle } from '../../domain/consultation/employeuse-actuelle'
import { ContactReferent } from '../../domain/contact-referent'
import { DenominationEmployeuse } from '../../domain/denomination-employeuse'
import type { Employeuse } from '../../domain/employeuse'
import { EmployeuseId } from '../../domain/employeuse-id'
import { Rna } from '../../domain/rna'

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

export const personneEmployeuseSelect = {
  affectationsEmploi: {
    select: {
      source: true,
      estActive: true,
      createdAt: true,
      structureAdministrative: { select: employeuseSelect },
    },
  },
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

export const contratsLus = (rows: readonly ContratRow[]): ContratLu[] =>
  rows.flatMap((row) =>
    row.structureAdministrative
      ? [
          {
            employeuse: employeuseToDomain(row.structureAdministrative),
            debut: row.dateDebut,
            fin: row.dateFin,
            rupture: row.dateRupture,
          },
        ]
      : [],
  )

const affectationActuelleToDomain = (
  personne: PersonneEmployeuseActuellePayload,
): AffectationActuelle | null =>
  personne.employeuseActuelle
    ? {
        employeuse: employeuseToDomain(
          personne.employeuseActuelle.structureAdministrative,
        ),
        source: SourceAffectation(personne.employeuseActuelle.source),
      }
    : null

export const emploiActuelLu = (
  personne: PersonneEmployeuseActuellePayload,
): EmploiActuelLu => ({
  affectationActuelle: affectationActuelleToDomain(personne),
  contrats: contratsLus(personne.contrats),
})

export const historiqueDEmploiLu = (
  personne: PersonneEmployeusePayload,
): HistoriqueDEmploiLu => ({
  affectations: personne.affectationsEmploi.map(affectationToDomain),
  contrats: contratsLus(personne.contrats),
})
