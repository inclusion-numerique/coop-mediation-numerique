import { creerUnTagAction } from '@app/web/app/_actions/tags/creer-un-tag.action'
import { rechercherDesTagsAction } from '@app/web/app/_actions/tags/rechercher-des-tags.action'
import { authenticateCoordinateur } from '@app/web/auth/authenticateUser'
import {
  tagsInitiauxDuCra,
  visibilitesDeTagDuCra,
} from '@app/web/composition/activites/tags-du-cra'
import { getCraCoordinationPageData } from '@app/web/features/activites/use-cases/cra/getCraCoordinationPageData'
import CraPartenariatPage from '@app/web/features/activites/use-cases/cra/partenariat/CraPartenariatPage'
import { CraPartenariatData } from '@app/web/features/activites/use-cases/cra/partenariat/validation/CraPartenariatValidation'
import { CREER_UN_TAG_DU_CRA_KEY } from '@app/web/features/activites/use-cases/cra/tags/creer-un-tag.key'
import { RECHERCHER_DES_TAGS_DU_CRA_KEY } from '@app/web/features/activites/use-cases/cra/tags/rechercher-des-tags.key'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import {
  decodeSerializableState,
  type EncodedState,
} from '@app/web/utils/encodeSerializableState'
import type { DefaultValues } from 'react-hook-form'

const CreateCraPartenariatPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    v?: EncodedState<DefaultValues<CraPartenariatData>>
    retour?: string
  }>
}) => {
  const { retour, v } = await searchParams

  const user = await authenticateCoordinateur()
  const coordinateurId = user.coordinateur.id

  const stateFromUrl = v ? decodeSerializableState(v, {}) : {}

  const craPageData = await getCraCoordinationPageData(
    coordinateurId,
    {
      structuresPartenaires: [{}],
      ...stateFromUrl,
    },
    tagsInitiauxDuCra(user),
  )

  return (
    <ClientBinder
      bind={RECHERCHER_DES_TAGS_DU_CRA_KEY}
      to={rechercherDesTagsAction}
    >
      <ClientBinder bind={CREER_UN_TAG_DU_CRA_KEY} to={creerUnTagAction}>
        <CraPartenariatPage
          {...craPageData}
          coordinateurId={coordinateurId}
          visibilitesDeTag={visibilitesDeTagDuCra(user, {
            departemental: true,
          })}
          retour={retour}
        />
      </ClientBinder>
    </ClientBinder>
  )
}

export default CreateCraPartenariatPage
