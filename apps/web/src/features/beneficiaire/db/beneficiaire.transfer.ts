import type { Beneficiaire as PrismaBeneficiaire } from '@prisma/client'
import { AnneeNaissance } from '../domain/annee-naissance'
import type {
  Beneficiaire,
  BeneficiaireAnonyme,
  BeneficiaireIdentifie,
} from '../domain/beneficiaire'
import { BeneficiaireId } from '../domain/beneficiaire-id'
import { CommuneResidence } from '../domain/commune-residence'
import type { ContactTelephone } from '../domain/contact-telephone'
import { Email } from '../domain/email'
import { Genre } from '../domain/genre'
import { MediateurId } from '../domain/mediateur-id'
import { Nom } from '../domain/nom'
import { Notes } from '../domain/notes'
import { Prenom } from '../domain/prenom'
import { StatutSocial } from '../domain/statut-social'
import { Telephone } from '../domain/telephone'
import { TrancheAge } from '../domain/tranche-age'

const toContactTelephone = (
  row: Pick<PrismaBeneficiaire, 'telephone' | 'pasDeTelephone'>,
): ContactTelephone =>
  row.telephone
    ? { _tag: 'disponible', numero: Telephone(row.telephone) }
    : row.pasDeTelephone
      ? { _tag: 'pasDeTelephone' }
      : { _tag: 'nonRenseigne' }

const toCommuneResidence = (
  row: Pick<
    PrismaBeneficiaire,
    'commune' | 'communeCodePostal' | 'communeCodeInsee' | 'adresse'
  >,
): CommuneResidence | null =>
  row.commune && row.communeCodePostal && row.communeCodeInsee
    ? CommuneResidence({
        commune: row.commune,
        codePostal: row.communeCodePostal,
        codeInsee: row.communeCodeInsee,
        ...(row.adresse ? { adresse: row.adresse } : {}),
      })
    : null

const toBase = (row: PrismaBeneficiaire) => ({
  id: BeneficiaireId(row.id),
  mediateurId: MediateurId(row.mediateurId),
  genre: Genre(row.genre ?? 'NonCommunique'),
  trancheAge: TrancheAge(row.trancheAge ?? 'NonCommunique'),
  statutSocial: StatutSocial(row.statutSocial ?? 'NonCommunique'),
  creation: row.creation,
  modification: row.modification,
  suppression: row.suppression,
})

const toAnonyme = (row: PrismaBeneficiaire): BeneficiaireAnonyme => ({
  ...toBase(row),
  anonyme: true,
})

const toIdentifie = (row: PrismaBeneficiaire): BeneficiaireIdentifie => ({
  ...toBase(row),
  anonyme: false,
  prenom: Prenom(row.prenom ?? ''),
  nom: Nom(row.nom ?? ''),
  contactTelephone: toContactTelephone(row),
  email: row.email ? Email(row.email) : null,
  anneeNaissance: row.anneeNaissance
    ? AnneeNaissance(row.anneeNaissance)
    : null,
  communeResidence: toCommuneResidence(row),
  notes: row.notes ? Notes(row.notes) : null,
})

export const beneficiaireToDomain = (row: PrismaBeneficiaire): Beneficiaire =>
  row.anonyme ? toAnonyme(row) : toIdentifie(row)

const fromContactTelephone = (contact: ContactTelephone) => ({
  telephone: contact._tag === 'disponible' ? contact.numero : null,
  pasDeTelephone: contact._tag === 'pasDeTelephone',
})

const fromCommuneResidence = (commune: CommuneResidence | null) => ({
  adresse: commune?.adresse ?? null,
  commune: commune?.commune ?? null,
  communeCodePostal: commune?.codePostal ?? null,
  communeCodeInsee: commune?.codeInsee ?? null,
})

const fromGenre = (genre: Genre) => (genre === 'NonCommunique' ? null : genre)

const fromTrancheAge = (trancheAge: TrancheAge) =>
  trancheAge === 'NonCommunique' ? null : trancheAge

const fromStatutSocial = (statutSocial: StatutSocial) =>
  statutSocial === 'NonCommunique' ? null : statutSocial

export const beneficiaireFromDomain = (beneficiaire: Beneficiaire) => ({
  id: beneficiaire.id,
  mediateurId: beneficiaire.mediateurId,
  genre: fromGenre(beneficiaire.genre),
  trancheAge: fromTrancheAge(beneficiaire.trancheAge),
  statutSocial: fromStatutSocial(beneficiaire.statutSocial),
  anonyme: beneficiaire.anonyme,
  ...(beneficiaire.anonyme
    ? {
        prenom: null,
        nom: null,
        telephone: null,
        pasDeTelephone: false,
        email: null,
        anneeNaissance: null,
        adresse: null,
        commune: null,
        communeCodePostal: null,
        communeCodeInsee: null,
        notes: null,
      }
    : {
        prenom: beneficiaire.prenom,
        nom: beneficiaire.nom,
        ...fromContactTelephone(beneficiaire.contactTelephone),
        email: beneficiaire.email ?? null,
        anneeNaissance: beneficiaire.anneeNaissance ?? null,
        ...fromCommuneResidence(beneficiaire.communeResidence),
        notes: beneficiaire.notes ?? null,
      }),
})
