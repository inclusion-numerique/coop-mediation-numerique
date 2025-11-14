import { authenticateCoordinateur } from '@app/web/auth/authenticateUser'
import { getCraAnimationDataDefaultValuesFromExisting } from '@app/web/features/activites/use-cases/cra/animation/db/getCraAnimationDataDefaultValuesFromExisting'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import { notFound, redirect } from 'next/navigation'

const DupliquerCraAnimationPage = async ({
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

  const defaultValuesWithoutId = {
    ...defaultValues,
    id: undefined,
  }

  return redirect(
    `/coop/mes-activites/cra/animation?${
      retour ? `retour=${retour}&` : ''
    }v=${encodeSerializableState(defaultValuesWithoutId)}`,
  )
}

export default DupliquerCraAnimationPage
