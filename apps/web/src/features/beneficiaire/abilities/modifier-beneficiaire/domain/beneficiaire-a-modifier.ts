import type { AnneeNaissance } from '@app/web/features/beneficiaire/domain/annee-naissance'
import type { BeneficiaireIdentifie } from '@app/web/features/beneficiaire/domain/beneficiaire'
import type { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import type { CommuneResidence } from '@app/web/features/beneficiaire/domain/commune-residence'
import type { ContactTelephone } from '@app/web/features/beneficiaire/domain/contact-telephone'
import type { Email } from '@app/web/features/beneficiaire/domain/email'
import type { BeneficiaireNotFound } from '@app/web/features/beneficiaire/domain/errors'
import type { Genre } from '@app/web/features/beneficiaire/domain/genre'
import type { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import type { Nom } from '@app/web/features/beneficiaire/domain/nom'
import type { Notes } from '@app/web/features/beneficiaire/domain/notes'
import type { Prenom } from '@app/web/features/beneficiaire/domain/prenom'
import type { StatutSocial } from '@app/web/features/beneficiaire/domain/statut-social'
import type { Result } from '@app/web/libraries/result'

/**
 * Input validé pour modifier un bénéficiaire : les attributs éditables, plus
 * l'identifiant de la cible. Propre à cette ability.
 */
export type BeneficiaireAModifier = {
  readonly id: BeneficiaireId
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

export type ModifierBeneficiaire = (input: {
  beneficiaire: BeneficiaireAModifier
  mediateurId: MediateurId
}) => Promise<Result<BeneficiaireIdentifie, BeneficiaireNotFound>>
