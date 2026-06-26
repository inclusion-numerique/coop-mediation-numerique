import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import type { AdressBanFormFieldOption } from '@app/web/components/form/AdresseBanFormField'
import { banMunicipalityLabel } from '@app/web/external-apis/ban/banMunicipalityLabel'
import type { BeneficiaireAEditer } from '@app/web/features/beneficiaire/abilities/modifier-beneficiaire/domain/beneficiaire-a-editer'
import type { BeneficiaireData } from '@app/web/features/beneficiaire/forms/beneficiaire-validation'
import type { Beneficiaire } from '@prisma/client'
import type { DefaultValues } from 'react-hook-form'

/**
 * Construit l'aperçu BAN (option du select commune) à partir des champs commune
 * persistés. `undefined` tant que la commune n'est pas complètement renseignée.
 */
const beneficiaireCommuneResidenceToPreviewBanData = ({
  commune,
  communeCodeInsee,
  communeCodePostal,
}: Pick<Beneficiaire, 'communeCodePostal' | 'communeCodeInsee' | 'commune'>) =>
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

export type ModifierBeneficiaireView = {
  beneficiaireId: string
  displayName: string
  defaultValues: DefaultValues<BeneficiaireData> & {
    id: string
    mediateurId: string
  }
  communeResidenceDefaultOptions?: AdressBanFormFieldOption[]
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
}: BeneficiaireAEditer): ModifierBeneficiaireView => {
  const communeResidence = beneficiaireCommuneResidenceToPreviewBanData({
    commune,
    communeCodeInsee,
    communeCodePostal,
  })

  const communeResidenceDefaultOptions = communeResidence
    ? [
        {
          label: banMunicipalityLabel(communeResidence),
          value: communeResidence,
        } satisfies AdressBanFormFieldOption,
      ]
    : undefined

  return {
    beneficiaireId: id,
    displayName: getBeneficiaireDisplayName({ prenom, nom }),
    communeResidenceDefaultOptions,
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
      telephone,
      email,
      prenom: prenom ?? '',
      nom: nom ?? '',
    },
  }
}
