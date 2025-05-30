import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import { BeneficiaireOption } from '@app/web/features/beneficiaires/BeneficiaireOption'
import { BeneficiaireData } from '@app/web/features/beneficiaires/validation/BeneficiaireValidation'
import { trpc } from '@app/web/trpc'
import { useCallback, useMemo, useRef } from 'react'

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

export const useCraBeneficiaireLoadOptions = ({
  initialOptions: initialOptionsProperty,
  participants,
}: {
  initialOptions: BeneficiaireOption[]
  participants: { id: string }[] // will be excluded from the search query
}) => {
  const { client: trpcClient } = trpc.useContext()

  const initialOptions = useMemo(
    () =>
      initialOptionsProperty.map((option) =>
        option.value
          ? {
              value: option.value,
              label: beneficiaireOptionRichLabel(option.value),
            }
          : option,
      ),
    [initialOptionsProperty],
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

      const result = await trpcClient.beneficiaires.search.query({
        query: search,
        excludeIds: participants.map(({ id }) => id),
      })

      const hasMore = result.matchesCount - result.beneficiaires.length
      const hasMoreMessage = hasMore
        ? hasMore === 1
          ? `Veuillez préciser votre recherche - 1 bénéficiaire n’est pas affiché`
          : `Veuillez préciser votre recherche - ${hasMore} bénéficiaires ne sont pas affichés`
        : null

      return [
        {
          label: `${result.matchesCount} résultat${sPluriel(
            result.matchesCount,
          )}`,
          value: null,
        },
        ...result.beneficiaires.map((beneficiaire) => ({
          label: beneficiaireOptionRichLabel(beneficiaire),
          value: beneficiaire,
        })),
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
    [trpcClient, participants],
  )

  return {
    initialOptions,
    loadOptions,
  }
}
