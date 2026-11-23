import type { BeneficiaireEnregistre } from '@/features/beneficiaire/domain/beneficiaire-enregistre'
import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'

/**
 * Projection de lecture des informations propres d'un bénéficiaire (les champs
 * affichés sur sa fiche). Les agrégats transverses (comptes d'activités,
 * thématiques) sont composés par le hub, pas par cette ability.
 */
export type BeneficiaireInformations = Pick<
  BeneficiaireEnregistre,
  | 'id'
  | 'mediateurId'
  | 'rdvUserId'
  | 'rdvServicePublicId'
  | 'prenom'
  | 'nom'
  | 'email'
  | 'anneeNaissance'
  | 'notes'
  | 'genre'
  | 'trancheAge'
  | 'creation'
  | 'adresse'
  | 'telephone'
  | 'pasDeTelephone'
  | 'statutSocial'
  | 'commune'
  | 'communeCodePostal'
  | 'communeCodeInsee'
  | 'accompagnementsCount'
>

export type ConsulterBeneficiaire = (input: {
  beneficiaireId: BeneficiaireId
  mediateurId: MediateurId
}) => Promise<BeneficiaireInformations | null>
