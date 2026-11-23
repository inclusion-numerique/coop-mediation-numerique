import type { BeneficiaireEnregistre } from '@/features/beneficiaire/domain/beneficiaire-enregistre'
import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'

/**
 * Projection de lecture de l'état persisté à charger dans le formulaire de
 * modification (les champs éditables). Distincte du `BeneficiaireAModifier`, qui
 * est l'input validé de la mutation.
 */
export type BeneficiaireAEditer = Pick<
  BeneficiaireEnregistre,
  | 'id'
  | 'mediateurId'
  | 'prenom'
  | 'nom'
  | 'email'
  | 'anneeNaissance'
  | 'notes'
  | 'genre'
  | 'trancheAge'
  | 'adresse'
  | 'telephone'
  | 'pasDeTelephone'
  | 'statutSocial'
  | 'commune'
  | 'communeCodePostal'
  | 'communeCodeInsee'
>

export type LireBeneficiaireAEditer = (input: {
  beneficiaireId: BeneficiaireId
  mediateurId: MediateurId
}) => Promise<BeneficiaireAEditer | null>
