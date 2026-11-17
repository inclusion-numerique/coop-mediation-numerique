import type { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import type { Email } from '@/features/beneficiaire/domain/email'
import type { Nom } from '@/features/beneficiaire/domain/nom'
import type { Prenom } from '@/features/beneficiaire/domain/prenom'
import type { Telephone } from '@/features/beneficiaire/domain/telephone'

// Projection d'un bénéficiaire candidat à la déduplication. Partagée au niveau
// feature : consommée par l'ability `detecter-doublons` ET par l'ability
// `creer-ou-fusionner-depuis-usager-externe` (sans dépendance inter-ability).
export type DuplicateBeneficiaire = {
  readonly id: BeneficiaireId
  readonly nom: Nom | null
  readonly prenom: Prenom | null
  readonly telephone: Telephone | null
  readonly email: Email | null
  readonly creation: Date
  readonly anneeNaissance: AnneeNaissance | null
  readonly communeResidence: CommuneResidence | null
}
