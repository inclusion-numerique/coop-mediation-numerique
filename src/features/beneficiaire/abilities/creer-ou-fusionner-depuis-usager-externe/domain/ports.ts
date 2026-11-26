import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { DuplicateBeneficiaire } from '@/features/beneficiaire/domain/doublon-de-beneficiaire'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { EchecTechnique, Result } from '@/libraries/result'
import type {
  CommuneFields,
  DonneesDeFusion,
  MergedBeneficiaire,
  NouveauBeneficiaire,
  UsagerNormalise,
} from './usager-externe'

export type LireLeBeneficiaireLie = (critere: {
  readonly rdvUserId: number
  readonly mediateurId: MediateurId
}) => Promise<Result<MergedBeneficiaire | null, EchecTechnique>>

export type TrouverUnDoublon = (
  usager: Pick<UsagerNormalise, 'nom' | 'prenom' | 'telephone' | 'email'> & {
    readonly mediateurId: MediateurId
  },
) => Promise<Result<DuplicateBeneficiaire | null, EchecTechnique>>

export type CommuneDeLAdresse = (
  adresse: string,
) => Promise<Result<CommuneFields | null, EchecTechnique>>

export type MettreAJourLeBeneficiaire = (miseAJour: {
  readonly id: BeneficiaireId
  readonly mediateurId: MediateurId
  readonly donnees: DonneesDeFusion
}) => Promise<Result<MergedBeneficiaire, EchecTechnique>>

export type CreerLeBeneficiaire = (
  beneficiaire: NouveauBeneficiaire,
) => Promise<Result<MergedBeneficiaire, EchecTechnique>>

export type CreerOuFusionnerDepuisUsagerExternePorts = {
  readonly lireLeBeneficiaireLie: LireLeBeneficiaireLie
  readonly trouverUnDoublon: TrouverUnDoublon
  readonly communeDeLAdresse: CommuneDeLAdresse
  readonly mettreAJourLeBeneficiaire: MettreAJourLeBeneficiaire
  readonly creerLeBeneficiaire: CreerLeBeneficiaire
}
