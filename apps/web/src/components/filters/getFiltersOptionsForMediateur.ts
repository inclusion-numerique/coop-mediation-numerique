import { getFirstAndLastActiviteDate } from '@app/web/features/activites/use-cases/list/db/getFirstAndLastActiviteDate'
import { getInitialBeneficiairesOptionsForSearch } from '@app/web/features/beneficiaires/db/getInitialBeneficiairesOptionsForSearch'
import { getMediateurCommunesAndDepartementsOptions } from '@app/web/features/lieux-activite/getMediateurCommunesOptions'
import { getMediateursLieuxActiviteOptions } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import { getInitialMediateursOptionsForSearch } from '@app/web/mediateurs/getInitialMediateursOptionsForSearch'

export const getFiltersOptionsForMediateur = async ({
  user,
  mediateurCoordonnesIds,
  includeBeneficiaireIds,
}: {
  user: {
    mediateur?: { id: string } | null
    coordinateur?: { id: string } | null
  }
  mediateurCoordonnesIds?: string[]
  includeBeneficiaireIds?: string[]
}) => {
  const mediateurIds = [
    ...(user.mediateur?.id ? [user.mediateur.id] : []),
    ...(mediateurCoordonnesIds ?? []),
  ]

  const [
    { communesOptions, departementsOptions },
    initialBeneficiairesOptions,
    initialMediateursOptions,
    lieuxActiviteOptions,
    activiteDates,
  ] = await Promise.all([
    getMediateurCommunesAndDepartementsOptions({ mediateurIds }),
    getInitialBeneficiairesOptionsForSearch({
      mediateurId: user.mediateur?.id,
      includeBeneficiaireIds,
    }),
    getInitialMediateursOptionsForSearch({
      mediateurId: user.mediateur?.id,
      coordinateurId: user.coordinateur?.id,
      mediateurCoordonnesIds,
    }),
    getMediateursLieuxActiviteOptions({ mediateurIds }),
    getFirstAndLastActiviteDate({ mediateurIds }),
  ])

  return {
    communesOptions,
    departementsOptions,
    initialBeneficiairesOptions,
    initialMediateursOptions,
    lieuxActiviteOptions,
    activiteDates,
  }
}
