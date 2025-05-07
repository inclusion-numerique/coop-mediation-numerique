import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { getCraCollectifDataDefaultValuesFromExisting } from '@app/web/features/activites/use-cases/cra/collectif/db/getCraCollectifDataDefaultValuesFromExisting'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import { notFound, redirect } from 'next/navigation'

const DupliquerPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ retour?: string }>
}) => {
  const { id } = await params
  const { retour } = await searchParams

  const user = await authenticateMediateur()

  const defaultValues = await getCraCollectifDataDefaultValuesFromExisting({
    id,
    mediateurId: user.mediateur.id,
  })

  if (defaultValues == null) return notFound()

  const defaultValuesWithoutIds = {
    ...defaultValues,
    id: undefined,
    participantsAnonymes: defaultValues.participantsAnonymes
      ? { ...defaultValues.participantsAnonymes, id: undefined }
      : undefined,
  }

  return redirect(
    `/coop/mes-activites/cra/collectif?${
      retour ? `retour=${retour}&` : ''
    }v=${encodeSerializableState(defaultValuesWithoutIds)}`,
  )
}

export default DupliquerPage
