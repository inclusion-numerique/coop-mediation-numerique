import type { AnneeNaissance } from '@app/web/features/beneficiaire/domain/annee-naissance'
import type { BeneficiaireIdentifie } from '@app/web/features/beneficiaire/domain/beneficiaire'
import type { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import type { CommuneResidence } from '@app/web/features/beneficiaire/domain/commune-residence'
import type { ContactTelephone } from '@app/web/features/beneficiaire/domain/contact-telephone'
import type { Email } from '@app/web/features/beneficiaire/domain/email'
import type { Genre } from '@app/web/features/beneficiaire/domain/genre'
import type { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import type { Nom } from '@app/web/features/beneficiaire/domain/nom'
import type { Notes } from '@app/web/features/beneficiaire/domain/notes'
import type { Prenom } from '@app/web/features/beneficiaire/domain/prenom'
import type { StatutSocial } from '@app/web/features/beneficiaire/domain/statut-social'
import {
  TrancheAge,
  trancheAgeFromAnneeNaissance,
} from '@app/web/features/beneficiaire/domain/tranche-age'

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

export type CreerBeneficiaire = (input: {
  beneficiaire: BeneficiaireACreer
  mediateurId: MediateurId
}) => Promise<BeneficiaireIdentifie>
