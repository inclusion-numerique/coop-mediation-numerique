import type { BeneficiaireAEditer } from '@/features/beneficiaire/abilities/modifier-beneficiaire/domain/beneficiaire-a-editer'
import { nomAfficheDepuisLIdentite } from '@/features/beneficiaire/domain/beneficiaire'
import type { BeneficiaireData } from '@/features/beneficiaire/ui/forms/beneficiaire.validation'
import { telephoneDisplayString } from '@/libraries/telephone'

/**
 * Construit l'aperçu BAN (option du select commune) à partir des champs commune
 * persistés. `undefined` tant que la commune n'est pas complètement renseignée.
 */
const beneficiaireCommuneResidenceToPreviewBanData = ({
  commune,
  communeCodeInsee,
  communeCodePostal,
}: Pick<
  BeneficiaireAEditer,
  'communeCodePostal' | 'communeCodeInsee' | 'commune'
>) =>
  commune && communeCodePostal && communeCodeInsee
    ? // We only need data for preview in UI
      {
        id: communeCodeInsee, // Used as key in select component
        nom: commune,
        codePostal: communeCodePostal,
        codeInsee: communeCodeInsee,
        commune,
        latitude: 0,
        longitude: 0,
        contexte: '',
        label: commune,
      }
    : undefined

export type VueDeModificationDuBeneficiaire = {
  beneficiaireId: string
  displayName: string
  defaultValues: Partial<BeneficiaireData> & {
    id: string
    mediateurId: string
  }
}

/**
 * Met en forme l'état persisté pour le formulaire de modification : valeurs par
 * défaut, aperçu de la commune (BAN) et nom d'affichage. Pure, sans accès
 * données — l'orchestration vit dans la route.
 */
export const presentBeneficiaireAModifier = ({
  id,
  mediateurId,
  prenom,
  nom,
  email,
  anneeNaissance,
  notes,
  genre,
  trancheAge,
  adresse,
  telephone,
  pasDeTelephone,
  statutSocial,
  commune,
  communeCodePostal,
  communeCodeInsee,
}: BeneficiaireAEditer): VueDeModificationDuBeneficiaire => {
  const communeResidence = beneficiaireCommuneResidenceToPreviewBanData({
    commune,
    communeCodeInsee,
    communeCodePostal,
  })

  return {
    beneficiaireId: id,
    displayName: nomAfficheDepuisLIdentite({ prenom, nom }),
    defaultValues: {
      id,
      mediateurId,
      trancheAge,
      statutSocial,
      genre,
      adresse,
      notes,
      communeResidence,
      anneeNaissance,
      pasDeTelephone,
      telephone: telephone ? telephoneDisplayString(telephone) : telephone,
      email,
      prenom: prenom ?? '',
      nom: nom ?? '',
    },
  }
}
