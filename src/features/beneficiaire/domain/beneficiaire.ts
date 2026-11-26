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
import { type TrancheAge, trancheAgeForBeneficiaire } from './tranche-age'

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

export const estAnonyme = (
  beneficiaire: Beneficiaire,
): beneficiaire is BeneficiaireAnonyme => beneficiaire.anonyme

export const nomAfficheDepuisLIdentite = ({
  prenom,
  nom,
}: {
  prenom?: string | null
  nom?: string | null
}): string => [prenom, nom].filter(Boolean).join(' ') || 'Bénéficiaire anonyme'

export const nomAfficheDuBeneficiaire = (beneficiaire: Beneficiaire) =>
  beneficiaire.anonyme
    ? 'Bénéficiaire anonyme'
    : nomAfficheDepuisLIdentite(beneficiaire)

const toAdressString = ({ adresse, codePostal, commune }: CommuneResidence) =>
  [adresse, [codePostal, commune].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ')

export const beneficiaireAdresseString = (
  beneficiaire: BeneficiaireIdentifie,
): string | undefined =>
  beneficiaire.communeResidence
    ? toAdressString(beneficiaire.communeResidence)
    : undefined

export const toBeneficiaireIdentifie = (
  attributs: Pick<
    BeneficiaireIdentifie,
    | 'prenom'
    | 'nom'
    | 'contactTelephone'
    | 'email'
    | 'anneeNaissance'
    | 'communeResidence'
    | 'genre'
    | 'trancheAge'
    | 'statutSocial'
    | 'notes'
  >,
  {
    id,
    mediateurId,
    creation,
    modification,
  }: {
    id: BeneficiaireId
    mediateurId: MediateurId
    creation: Date
    modification: Date
  },
): BeneficiaireIdentifie => ({
  id,
  mediateurId,
  anonyme: false,
  prenom: attributs.prenom,
  nom: attributs.nom,
  contactTelephone: attributs.contactTelephone,
  email: attributs.email,
  anneeNaissance: attributs.anneeNaissance,
  communeResidence: attributs.communeResidence,
  notes: attributs.notes,
  genre: attributs.genre,
  statutSocial: attributs.statutSocial,
  trancheAge: trancheAgeForBeneficiaire(
    attributs.anneeNaissance,
    attributs.trancheAge,
    modification,
  ),
  creation,
  modification,
  suppression: null,
})
