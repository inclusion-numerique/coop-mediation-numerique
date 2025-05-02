import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { getCraIndividuelDataDefaultValuesFromExisting } from '@app/web/features/activites/use-cases/cra/individuel/db/getCraIndividuelDataDefaultValuesFromExisting'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import { notFound, redirect } from 'next/navigation'

const DupliquerPage = async ({
  params: { id },
  searchParams: { retour } = {},
}: {
  params: { id: string }
  searchParams?: { retour?: string }
}) => {
  const user = await authenticateMediateur()

  const defaultValues = await getCraIndividuelDataDefaultValuesFromExisting({
    id,
    mediateurId: user.mediateur.id,
  })

  if (defaultValues == null) return notFound()

  const defaultValuesWithoutId = {
    ...defaultValues,
    id: undefined,
  }

  return redirect(
    `/coop/mes-activites/cra/individuel?${
      retour ? `retour=${retour}&` : ''
    }v=${encodeSerializableState(defaultValuesWithoutId)}`,
  )
}

export default DupliquerPage
