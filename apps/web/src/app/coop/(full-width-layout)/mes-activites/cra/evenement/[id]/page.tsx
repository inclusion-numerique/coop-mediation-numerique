import { authenticateCoordinateur } from '@app/web/auth/authenticateUser'
import CraEvenementPage from '@app/web/features/activites/use-cases/cra/evenement/CraEvenementPage'
import { getCraEvenementDataDefaultValuesFromExisting } from '@app/web/features/activites/use-cases/cra/evenement/db/getCraEvenementDataDefaultValuesFromExisting'
import { getCraCoordinationPageData } from '@app/web/features/activites/use-cases/cra/getCraCoordinationPageData'
import { notFound } from 'next/navigation'

const UpdateCraEvenementPage = async ({
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

  const defaultValues = await getCraEvenementDataDefaultValuesFromExisting({
    id,
    coordinateurId,
  })

  if (defaultValues == null) return notFound()

  const craPageData = await getCraCoordinationPageData(
    coordinateurId,
    defaultValues,
  )

  return (
    <CraEvenementPage
      {...craPageData}
      coordinateurId={coordinateurId}
      retour={retour}
    />
  )
}

export default UpdateCraEvenementPage
