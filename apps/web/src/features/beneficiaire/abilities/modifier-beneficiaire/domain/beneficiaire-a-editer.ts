import type { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import type { Beneficiaire } from '@prisma/client'

/**
 * Projection de lecture de l'état persisté à charger dans le formulaire de
 * modification (les champs éditables). Distincte du `BeneficiaireAModifier`, qui
 * est l'input validé de la mutation.
 */
export type BeneficiaireAEditer = Pick<
  Beneficiaire,
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
