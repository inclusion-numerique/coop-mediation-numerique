import type { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import type { BeneficiaireIdentifie } from '@/features/beneficiaire/domain/beneficiaire'
import type { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import type { ContactTelephone } from '@/features/beneficiaire/domain/contact-telephone'
import type { Email } from '@/features/beneficiaire/domain/email'
import type { Genre } from '@/features/beneficiaire/domain/genre'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { Nom } from '@/features/beneficiaire/domain/nom'
import type { Notes } from '@/features/beneficiaire/domain/notes'
import type { Prenom } from '@/features/beneficiaire/domain/prenom'
import type { StatutSocial } from '@/features/beneficiaire/domain/statut-social'
import type { TrancheAge } from '@/features/beneficiaire/domain/tranche-age'

/**
 * Input validé pour créer un bénéficiaire : les attributs éditables, sans
 * identifiant (il est attribué à la création). Propre à cette ability.
 */
export type BeneficiaireACreer = {
  readonly prenom: Prenom
  readonly nom: Nom
  readonly contactTelephone: ContactTelephone
  readonly email: Email | null
  readonly anneeNaissance: AnneeNaissance | null
  readonly communeResidence: CommuneResidence | null
  readonly genre: Genre
  readonly trancheAge: TrancheAge
  readonly statutSocial: StatutSocial
  readonly notes: Notes | null
}

export type CreerBeneficiaire = (input: {
  beneficiaire: BeneficiaireACreer
  mediateurId: MediateurId
}) => Promise<BeneficiaireIdentifie>
