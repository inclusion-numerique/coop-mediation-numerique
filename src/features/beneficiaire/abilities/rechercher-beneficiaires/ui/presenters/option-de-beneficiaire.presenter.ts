import type { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import type { BeneficiaireData } from '@/features/beneficiaire/ui/forms/beneficiaire.validation'
import type { AdresseBanData } from '@/libraries/adresse'
import type { SelectOption } from '@/libraries/ui'
import type { BeneficiaireTrouve } from '../../domain/beneficiaires-recherches'

type BeneficiaireProposeData = Omit<BeneficiaireData, 'id'> & {
  id: string | null
}

export type BeneficiaireOption = SelectOption<BeneficiaireProposeData | null>

export const toPreviewBanData = (
  communeResidence: CommuneResidence,
): AdresseBanData => ({
  id: communeResidence.codeInsee,
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
