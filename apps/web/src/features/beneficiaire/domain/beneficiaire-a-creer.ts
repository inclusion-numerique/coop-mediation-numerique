import type { AnneeNaissance } from './annee-naissance'
import type { BeneficiaireIdentifie } from './beneficiaire'
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
import { TrancheAge, trancheAgeFromAnneeNaissance } from './tranche-age'

/**
 * Input validé pour créer un bénéficiaire identifié.
 *
 * Forme structurée du domaine (value objects, discriminated unions),
 * indépendante de la forme du formulaire (cf. la validation au format wire).
 */
export type BeneficiaireACreer = {
  readonly prenom: Prenom
  readonly nom: Nom
  readonly contactTelephone: ContactTelephone
  readonly email: Email | null
  readonly anneeNaissance: AnneeNaissance | null
  readonly communeResidence: CommuneResidence | null
  readonly genre: Genre
  readonly statutSocial: StatutSocial
  readonly notes: Notes | null
}

/**
 * La tranche d'âge est dérivée de l'année de naissance (règle métier),
 * jamais saisie directement. Sans année de naissance : `NonCommunique`.
 */
export const trancheAgeForBeneficiaire = (
  anneeNaissance: AnneeNaissance | null,
): TrancheAge =>
  anneeNaissance
    ? trancheAgeFromAnneeNaissance(anneeNaissance)
    : TrancheAge('NonCommunique')

/**
 * Construit l'entité bénéficiaire identifiée à partir de l'input validé.
 * Fonction pure : les identifiants et horodatages sont fournis par l'appelant.
 */
export const toBeneficiaireIdentifie = (
  input: BeneficiaireACreer,
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
  prenom: input.prenom,
  nom: input.nom,
  contactTelephone: input.contactTelephone,
  email: input.email,
  anneeNaissance: input.anneeNaissance,
  communeResidence: input.communeResidence,
  notes: input.notes,
  genre: input.genre,
  statutSocial: input.statutSocial,
  trancheAge: trancheAgeForBeneficiaire(input.anneeNaissance),
  creation,
  modification,
  suppression: null,
})
