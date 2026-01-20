import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import CraCollectifPage from '@app/web/features/activites/use-cases/cra/collectif/CraCollectifPage'
import { getCraCollectifDataDefaultValuesFromExisting } from '@app/web/features/activites/use-cases/cra/collectif/db/getCraCollectifDataDefaultValuesFromExisting'
import type { CraCollectifData } from '@app/web/features/activites/use-cases/cra/collectif/validation/CraCollectifValidation'
import { getCraPageData } from '@app/web/features/activites/use-cases/cra/getCraPageData'
import { getEquipesFromSessionUser } from '@app/web/features/activites/use-cases/tags/save/getEquipesFromSessionUser'
import { notFound } from 'next/navigation'

const UpdateCraCollectifPage = async ({
  searchParams,
  params,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ retour?: string }>
}) => {
  const { id } = await params
  const { retour } = await searchParams

  const user = await authenticateMediateur()
  const mediateurId = user.mediateur.id
  const equipes = getEquipesFromSessionUser(user)

  const defaultValues = await getCraCollectifDataDefaultValuesFromExisting({
    id,
    mediateurId,
  })

  if (defaultValues == null) return notFound()

  const craPageData = await getCraPageData<CraCollectifData>()(
    mediateurId,
    defaultValues,
  )

  return (
    <CraCollectifPage
      {...craPageData}
      mediateurId={mediateurId}
      equipes={equipes}
      retour={retour}
    />
  )
}

export default UpdateCraCollectifPage
