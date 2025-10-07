import { getHasCrasV1 } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/getHasCrasV1'
import { getFirstAndLastActiviteDate } from '@app/web/features/activites/use-cases/list/db/getFirstAndLastActiviteDate'
import { activiteSourceOptions } from '@app/web/features/activites/use-cases/source/activiteSource'
import { getMediateursTags } from '@app/web/features/activites/use-cases/tags/db/getMediateursTags'
import { getInitialBeneficiairesOptionsForSearch } from '@app/web/features/beneficiaires/db/getInitialBeneficiairesOptionsForSearch'
import { getMediateurCommunesAndDepartementsOptions } from '@app/web/features/lieux-activite/getMediateurCommunesOptions'
import { getMediateursLieuxActiviteOptions } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import { getUserDepartement } from '@app/web/features/utilisateurs/utils/getUserDepartement'
import { getInitialMediateursOptionsForSearch } from '@app/web/mediateurs/getInitialMediateursOptionsForSearch'
import type { UserDisplayName, UserProfile } from '@app/web/utils/user'

export const getFiltersOptionsForMediateur = async ({
  user,
  mediateurCoordonnesIds,
  includeBeneficiaireIds,
}: {
  user: UserDisplayName & UserProfile
  mediateurCoordonnesIds?: string[]
  includeBeneficiaireIds?: string[]
}) => {
  const mediateurIds = [
    ...(user.mediateur?.id ? [user.mediateur.id] : []),
    ...(mediateurCoordonnesIds ?? []),
  ]

  const [
    { communesOptions, departementsOptions },
    tagsOptions,
    initialBeneficiairesOptions,
    initialMediateursOptions,
    lieuxActiviteOptions,
    activiteDates,
    hasCrasV1,
  ] = await Promise.all([
    getMediateurCommunesAndDepartementsOptions({ mediateurIds }),
    getMediateursTags({
      mediateurIds,
      departement: getUserDepartement(user)?.code,
    }),
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
    getHasCrasV1({ mediateurIds }),
  ])

  return {
    communesOptions,
    departementsOptions,
    tagsOptions,
    initialBeneficiairesOptions,
    initialMediateursOptions,
    lieuxActiviteOptions,
    activiteDates,
    hasCrasV1,
    activiteSourceOptions: hasCrasV1 ? activiteSourceOptions : [],
  }
}
