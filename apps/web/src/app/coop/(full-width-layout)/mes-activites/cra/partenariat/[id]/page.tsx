import { authenticateCoordinateur } from '@app/web/auth/authenticateUser'
import { getCraCoordinationPageData } from '@app/web/features/activites/use-cases/cra/getCraCoordinationPageData'
import CraPartenariatPage from '@app/web/features/activites/use-cases/cra/partenariat/CraPartenariatPage'
import { getCraPartenariatDataDefaultValuesFromExisting } from '@app/web/features/activites/use-cases/cra/partenariat/db/getCraPartenariatDataDefaultValuesFromExisting'
import { getEquipesFromSessionUser } from '@app/web/features/activites/use-cases/tags/save/getEquipesFromSessionUser'
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

  const user = await authenticateCoordinateur()
  const coordinateurId = user.coordinateur.id
  const equipes = getEquipesFromSessionUser(user)

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
      equipes={equipes}
      retour={retour}
    />
  )
}

export default UpdateCraPartenariatPage
