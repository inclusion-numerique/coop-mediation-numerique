import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import type { CraCollectifData } from '@app/web/features/activites/use-cases/cra/collectif/validation/CraCollectifValidation'
import { getCraPageData } from '@app/web/features/activites/use-cases/cra/getCraPageData'
import CraIndividuelPage from '@app/web/features/activites/use-cases/cra/individuel/CraIndividuelPage'
import { getCraIndividuelDataDefaultValuesFromExisting } from '@app/web/features/activites/use-cases/cra/individuel/db/getCraIndividuelDataDefaultValuesFromExisting'
import { notFound } from 'next/navigation'

const UpdateCraIndividuelPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ retour?: string }>
}) => {
  const { id } = await params
  const { retour } = await searchParams

  const {
    mediateur: { id: mediateurId },
  } = await authenticateMediateur()

  const defaultValues = await getCraIndividuelDataDefaultValuesFromExisting({
    id,
    mediateurId,
  })

  if (defaultValues == null) return notFound()

  const craPageData = await getCraPageData<CraCollectifData>()(
    mediateurId,
    defaultValues,
  )

  return (
    <CraIndividuelPage
      {...craPageData}
      mediateurId={mediateurId}
      retour={retour}
    />
  )
}

export default UpdateCraIndividuelPage
