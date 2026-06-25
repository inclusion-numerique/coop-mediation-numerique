import { rechercherBeneficiairesAction } from '@app/web/app/_actions/beneficiaire/rechercher-beneficiaires.action'
import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import { toBeneficiaireData } from '@app/web/features/beneficiaire/abilities/rechercher-beneficiaires/ui/beneficiaire-option'
import type { BeneficiaireOption } from '@app/web/features/beneficiaires/BeneficiaireOption'
import type { BeneficiaireData } from '@app/web/features/beneficiaires/validation/BeneficiaireValidation'
import { pluriel } from '@app/web/libraries/pluriel'
import { useCallback } from 'react'

const beneficiaireOptionRichLabel = (value: BeneficiaireData) => {
  const { communeResidence } = value

  return (
    <>
      <div className="fr-width-full fr-text--bold fr-text-title--blue-france fr-mb-0">
        {getBeneficiaireDisplayName(value)}
      </div>
      {!!communeResidence && (
        <div className="fr-width-full fr-text--xs fr-text-mention--grey fr-mb-0">
          {communeResidence.nom}
          {!!communeResidence.codePostal && ` · ${communeResidence.codePostal}`}
        </div>
      )}
    </>
  ) as unknown as string // ReactNode is supported but types are not up to date
}

export const useBeneficiaireSearch = ({
  initialBeneficiairesOptions,
}: {
  initialBeneficiairesOptions: BeneficiaireOption[]
}) => {
  const initialOptions = initialBeneficiairesOptions.map((option) =>
    option.value
      ? {
          value: option.value,
          label: beneficiaireOptionRichLabel(option.value),
        }
      : option,
  )

  const loadOptions = useCallback(
    async (search: string): Promise<BeneficiaireOption[]> => {
      if (search.trim().length < 3) {
        return [
          {
            label: `La recherche doit contenir au moins 3 caractères`,
            value: null,
          },
        ]
      }

      const result = await rechercherBeneficiairesAction({ query: search })

      if (!result.success) {
        return [{ label: 'Une erreur est survenue', value: null }]
      }

      const { beneficiaires, totalCount } = result.data

      const hasMore = totalCount - beneficiaires.length
      const hasMoreMessage = hasMore
        ? hasMore === 1
          ? `Veuillez préciser votre recherche - 1 bénéficiaire n’est pas affiché`
          : `Veuillez préciser votre recherche - ${hasMore} bénéficiaires ne sont pas affichés`
        : null

      return [
        {
          label: `${totalCount} ${pluriel(totalCount, 'résultat', 'résultats')}`,
          value: null,
        },
        ...beneficiaires.map((beneficiaire) => {
          const value = toBeneficiaireData(beneficiaire)
          return {
            label: beneficiaireOptionRichLabel(value),
            value,
          }
        }),
        ...(hasMoreMessage
          ? [
              {
                label: hasMoreMessage,
                value: null,
              },
            ]
          : []),
      ]
    },
    [],
  )

  return {
    initialOptions,
    loadOptions,
  }
}
