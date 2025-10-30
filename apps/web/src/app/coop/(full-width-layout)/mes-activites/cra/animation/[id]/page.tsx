import { authenticateCoordinateur } from '@app/web/auth/authenticateUser'
import CraAnimationPage from '@app/web/features/activites/use-cases/cra/animation/CraAnimationPage'
import { getCraAnimationDataDefaultValuesFromExisting } from '@app/web/features/activites/use-cases/cra/animation/db/getCraAnimationDataDefaultValuesFromExisting'
import { getCraCoordinationPageData } from '@app/web/features/activites/use-cases/cra/getCraCoordinationPageData'
import { notFound } from 'next/navigation'

const UpdateCraAnimationPage = async ({
  searchParams,
  params,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ retour?: string }>
}) => {
  const { id } = await params
  const { retour } = await searchParams

  const {
    coordinateur: { id: coordinateurId },
  } = await authenticateCoordinateur()

  const defaultValues = await getCraAnimationDataDefaultValuesFromExisting({
    id,
    coordinateurId,
  })

  if (defaultValues == null) return notFound()

  const craPageData = await getCraCoordinationPageData(
    coordinateurId,
    defaultValues,
  )

  return (
    <CraAnimationPage
      {...craPageData}
      coordinateurId={coordinateurId}
      retour={retour}
    />
  )
}

export default UpdateCraAnimationPage
