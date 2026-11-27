import type { BeneficiaireEnregistre } from '@/features/beneficiaire/domain/beneficiaire-enregistre'

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
