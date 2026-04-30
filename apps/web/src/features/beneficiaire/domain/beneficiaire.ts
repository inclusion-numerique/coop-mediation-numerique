import type { AnneeNaissance } from './annee-naissance'
import type { BeneficiaireId } from './beneficiaire-id'
import type { CommuneResidence } from './commune-residence'
import type { ContactTelephone } from './contact-telephone'
import type { Email } from './email'
import type { Genre } from './genre'
import type { MediateurId } from './mediateur-id'
import type { Nom } from './nom'
import type { Notes } from './notes'
import type { Prenom } from './prenom'
import type { StatutSocial } from './statut-social'
import type { TrancheAge } from './tranche-age'

type BeneficiaireBase = {
  readonly id: BeneficiaireId
  readonly mediateurId: MediateurId
  readonly genre: Genre
  readonly trancheAge: TrancheAge
  readonly statutSocial: StatutSocial
  readonly creation: Date
  readonly modification: Date
  readonly suppression: Date | null
}

export type BeneficiaireAnonyme = BeneficiaireBase & {
  readonly anonyme: true
}

export type BeneficiaireIdentifie = BeneficiaireBase & {
  readonly anonyme: false
  readonly prenom: Prenom
  readonly nom: Nom
  readonly contactTelephone: ContactTelephone
  readonly email: Email | null
  readonly anneeNaissance: AnneeNaissance | null
  readonly communeResidence: CommuneResidence | null
  readonly notes: Notes | null
}

export type Beneficiaire = BeneficiaireAnonyme | BeneficiaireIdentifie

export const isBeneficiaireAnonymous = (
  beneficiaire: Beneficiaire,
): beneficiaire is BeneficiaireAnonyme => beneficiaire.anonyme

export const getBeneficiaireDisplayName = (beneficiaire: Beneficiaire) =>
  beneficiaire.anonyme
    ? 'Bénéficiaire anonyme'
    : [beneficiaire.prenom, beneficiaire.nom].filter(Boolean).join(' ')

const toAdressString = ({ adresse, codePostal, commune }: CommuneResidence) =>
  [adresse, [codePostal, commune].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ')

export const getBeneficiaireAdresseString = (
  beneficiaire: BeneficiaireIdentifie,
): string | undefined =>
  beneficiaire.communeResidence
    ? toAdressString(beneficiaire.communeResidence)
    : undefined
