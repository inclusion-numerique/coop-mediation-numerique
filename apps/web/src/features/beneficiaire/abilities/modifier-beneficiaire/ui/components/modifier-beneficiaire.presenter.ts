import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import { beneficiaireCommuneResidenceToPreviewBanData } from '@app/web/beneficiaire/prismaBeneficiaireToBeneficiaireData'
import type { AdressBanFormFieldOption } from '@app/web/components/form/AdresseBanFormField'
import { banMunicipalityLabel } from '@app/web/external-apis/ban/banMunicipalityLabel'
import type { BeneficiaireAEditer } from '@app/web/features/beneficiaire/abilities/modifier-beneficiaire/domain/beneficiaire-a-editer'
import type { BeneficiaireData } from '@app/web/features/beneficiaires/validation/BeneficiaireValidation'
import type { DefaultValues } from 'react-hook-form'

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
