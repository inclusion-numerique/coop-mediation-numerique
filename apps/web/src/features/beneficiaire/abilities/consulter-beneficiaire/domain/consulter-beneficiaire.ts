import type { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import type { Beneficiaire } from '@prisma/client'

/**
 * Projection de lecture des informations propres d'un bénéficiaire (les champs
 * affichés sur sa fiche). Les agrégats transverses (comptes d'activités,
 * thématiques) sont composés par le hub, pas par cette ability.
 */
export type BeneficiaireInformations = Pick<
  Beneficiaire,
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
