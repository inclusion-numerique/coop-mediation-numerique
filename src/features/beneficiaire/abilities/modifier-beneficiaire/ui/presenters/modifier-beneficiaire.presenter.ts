import type { BeneficiaireAEditer } from '@/features/beneficiaire/abilities/modifier-beneficiaire/domain/beneficiaire-a-editer'
import { nomAfficheDepuisLIdentite } from '@/features/beneficiaire/domain/beneficiaire'
import type { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import type { BeneficiaireData } from '@/features/beneficiaire/ui/forms/beneficiaire.validation'
import { telephoneDisplayString } from '@/libraries/telephone'

const apercuDeLaCommune = (communeResidence: CommuneResidence | null) =>
  communeResidence === null
    ? undefined
    : {
        id: communeResidence.codeInsee,
        nom: communeResidence.commune,
        codePostal: communeResidence.codePostal,
        codeInsee: communeResidence.codeInsee,
        commune: communeResidence.commune,
        latitude: 0,
        longitude: 0,
        contexte: '',
        label: communeResidence.commune,
      }

export type VueDeModificationDuBeneficiaire = {
  beneficiaireId: string
  displayName: string
  defaultValues: Partial<BeneficiaireData> & {
    id: string
    mediateurId: string
  }
}

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
  communeResidence,
}: BeneficiaireAEditer): VueDeModificationDuBeneficiaire => {
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
      communeResidence: apercuDeLaCommune(communeResidence),
      anneeNaissance,
      pasDeTelephone,
      telephone: telephone ? telephoneDisplayString(telephone) : telephone,
      email,
      prenom: prenom ?? '',
      nom: nom ?? '',
    },
  }
}
