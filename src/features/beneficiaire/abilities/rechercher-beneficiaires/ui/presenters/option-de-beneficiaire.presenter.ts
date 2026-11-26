import type { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import type { BeneficiaireData } from '@/features/beneficiaire/ui/forms/beneficiaire.validation'
import type { AdresseBanData } from '@/libraries/adresse'
import type { SelectOption } from '@/libraries/ui'
import type { BeneficiaireTrouve } from '../../domain/beneficiaires-recherches'

/**
 * Adapte la projection domaine `BeneficiaireSearchItem` vers les formes
 * attendues à la frontière UI (combobox de sélection, options de filtre), qui
 * raisonnent encore en `BeneficiaireData` / `AdresseBanData`.
 */

// Option de select pour un bénéficiaire (valeur `null` = ligne non
// sélectionnable, p.ex. message « préciser la recherche »).
type BeneficiaireProposeData = Omit<BeneficiaireData, 'id'> & {
  id: string | null
}

export type BeneficiaireOption = SelectOption<BeneficiaireProposeData | null>

// `CommuneResidence` (value object) → aperçu `AdresseBanData` : on ne dispose
// que des champs d'affichage, le reste est rempli avec des valeurs neutres.
export const toPreviewBanData = (
  communeResidence: CommuneResidence,
): AdresseBanData => ({
  id: communeResidence.codeInsee, // sert de clé d'option dans le select
  nom: communeResidence.commune,
  commune: communeResidence.commune,
  codePostal: communeResidence.codePostal,
  codeInsee: communeResidence.codeInsee,
  label: communeResidence.commune,
  contexte: '',
  latitude: 0,
  longitude: 0,
})

export const toBeneficiaireData = (
  item: BeneficiaireTrouve,
): BeneficiaireProposeData => ({
  id: item.id,
  prenom: item.prenom,
  nom: item.nom,
  communeResidence: item.communeResidence
    ? toPreviewBanData(item.communeResidence)
    : null,
})
