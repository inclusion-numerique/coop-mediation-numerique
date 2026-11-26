import type { BeneficiaireEnregistre } from '@/features/beneficiaire/domain/beneficiaire-enregistre'
import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'

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
