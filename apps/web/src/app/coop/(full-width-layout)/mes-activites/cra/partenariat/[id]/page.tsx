import { authenticateCoordinateur } from '@app/web/auth/authenticateUser'
import { getCraCoordinationPageData } from '@app/web/features/activites/use-cases/cra/getCraCoordinationPageData'
import CraPartenariatPage from '@app/web/features/activites/use-cases/cra/partenariat/CraPartenariatPage'
import { getCraPartenariatDataDefaultValuesFromExisting } from '@app/web/features/activites/use-cases/cra/partenariat/db/getCraPartenariatDataDefaultValuesFromExisting'
import { notFound } from 'next/navigation'

const UpdateCraPartenariatPage = async ({
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

  const defaultValues = await getCraPartenariatDataDefaultValuesFromExisting({
    id,
    coordinateurId,
  })

  if (defaultValues == null) return notFound()

  const craPageData = await getCraCoordinationPageData(
    coordinateurId,
    defaultValues,
  )

  return (
    <CraPartenariatPage
      {...craPageData}
      coordinateurId={coordinateurId}
      retour={retour}
    />
  )
}

export default UpdateCraPartenariatPage
