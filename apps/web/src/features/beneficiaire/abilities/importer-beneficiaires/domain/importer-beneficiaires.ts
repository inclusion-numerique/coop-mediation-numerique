import type { AnneeNaissance } from '@app/web/features/beneficiaire/domain/annee-naissance'
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
 * Input validé pour importer un bénéficiaire : les attributs éditables issus
 * d'une ligne de fichier. Propre à cette ability — les lignes non importables
 * (prénom ou nom manquant / invalide) ont déjà été écartées en amont.
 */
export type BeneficiaireAImporter = {
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

export type ImporterBeneficiaires = (input: {
  beneficiaires: readonly BeneficiaireAImporter[]
  mediateurId: MediateurId
}) => Promise<{ importes: number }>
