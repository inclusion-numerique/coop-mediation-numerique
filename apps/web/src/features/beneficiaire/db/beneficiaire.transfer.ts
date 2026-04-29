import type { Beneficiaire as PrismaBeneficiaire } from '@prisma/client'
import {
  BeneficiaireId,
  type Beneficiaire,
  type Genre,
  type StatutSocial,
  type TrancheAge,
} from '../domain'

export const beneficiaireToDomain = (
  row: PrismaBeneficiaire,
): Beneficiaire => ({
  id: BeneficiaireId.parse(row.id),
  mediateurId: row.mediateurId,
  prenom: row.prenom,
  nom: row.nom,
  telephone: row.telephone,
  pasDeTelephone: row.pasDeTelephone ?? false,
  email: row.email,
  anneeNaissance: row.anneeNaissance,
  adresse: row.adresse,
  commune: row.commune,
  communeCodePostal: row.communeCodePostal,
  communeCodeInsee: row.communeCodeInsee,
  genre: row.genre as Genre | null,
  trancheAge: row.trancheAge as TrancheAge | null,
  statutSocial: row.statutSocial as StatutSocial | null,
  notes: row.notes,
  anonyme: row.anonyme,
  creation: row.creation,
  modification: row.modification,
  suppression: row.suppression,
})

export const beneficiaireFromDomain = (
  beneficiaire: Omit<Beneficiaire, 'creation' | 'modification' | 'suppression'>,
) => ({
  id: beneficiaire.id as string,
  mediateurId: beneficiaire.mediateurId,
  prenom: beneficiaire.prenom,
  nom: beneficiaire.nom,
  telephone: beneficiaire.telephone,
  pasDeTelephone: beneficiaire.pasDeTelephone,
  email: beneficiaire.email,
  anneeNaissance: beneficiaire.anneeNaissance,
  adresse: beneficiaire.adresse,
  commune: beneficiaire.commune,
  communeCodePostal: beneficiaire.communeCodePostal,
  communeCodeInsee: beneficiaire.communeCodeInsee,
  genre: beneficiaire.genre,
  trancheAge: beneficiaire.trancheAge,
  statutSocial: beneficiaire.statutSocial,
  notes: beneficiaire.notes,
  anonyme: beneficiaire.anonyme,
})
