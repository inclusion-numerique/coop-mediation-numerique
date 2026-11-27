import { nomAfficheDepuisLIdentite } from '@/features/beneficiaire/domain/beneficiaire'
import type { BeneficiairesRecherches } from '../../domain/beneficiaires-recherches'
import {
  type BeneficiaireOption,
  toBeneficiaireData,
} from './option-de-beneficiaire.presenter'

const nonAffichesOption = (count: number): BeneficiaireOption => ({
  label: `Veuillez préciser votre recherche - ${count} bénéficiaire${
    count === 1 ? ' n’est pas affiché' : 's ne sont pas affichés'
  }`,
  value: null,
})

export const optionsDesBeneficiairesInitiaux = ({
  beneficiaires,
  totalCount,
}: BeneficiairesRecherches): BeneficiaireOption[] => {
  const options: BeneficiaireOption[] = beneficiaires.map((beneficiaire) => ({
    label: nomAfficheDepuisLIdentite(beneficiaire),
    value: toBeneficiaireData(beneficiaire),
  }))

  const nonAffiches = totalCount - options.length

  return nonAffiches > 0
    ? [...options, nonAffichesOption(nonAffiches)]
    : options
}
