import { authenticateCoordinateur } from '@app/web/auth/authenticateUser'
import { getCraPartenariatDataDefaultValuesFromExisting } from '@app/web/features/activites/use-cases/cra/partenariat/db/getCraPartenariatDataDefaultValuesFromExisting'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import { notFound, redirect } from 'next/navigation'

const DupliquerCraPartenariatPage = async ({
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

  const defaultValuesWithoutId = {
    ...defaultValues,
    id: undefined,
  }

  return redirect(
    `/coop/mes-activites/cra/partenariat?${
      retour ? `retour=${retour}&` : ''
    }v=${encodeSerializableState(defaultValuesWithoutId)}`,
  )
}

export default DupliquerCraPartenariatPage
