import type { AnneeNaissance } from '@app/web/features/beneficiaire/domain/annee-naissance'
import type { BeneficiaireIdentifie } from '@app/web/features/beneficiaire/domain/beneficiaire'
import type { CommuneResidence } from '@app/web/features/beneficiaire/domain/commune-residence'
import type { ContactTelephone } from '@app/web/features/beneficiaire/domain/contact-telephone'
import type { Email } from '@app/web/features/beneficiaire/domain/email'
import type { Genre } from '@app/web/features/beneficiaire/domain/genre'
import type { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import type { Nom } from '@app/web/features/beneficiaire/domain/nom'
import type { Notes } from '@app/web/features/beneficiaire/domain/notes'
import type { Prenom } from '@app/web/features/beneficiaire/domain/prenom'
import type { StatutSocial } from '@app/web/features/beneficiaire/domain/statut-social'

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
  readonly statutSocial: StatutSocial
  readonly notes: Notes | null
}

export type CreerBeneficiaire = (input: {
  beneficiaire: BeneficiaireACreer
  mediateurId: MediateurId
}) => Promise<BeneficiaireIdentifie>
