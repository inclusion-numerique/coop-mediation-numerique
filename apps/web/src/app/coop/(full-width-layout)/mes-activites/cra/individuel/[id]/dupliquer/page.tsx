import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { getCraIndividuelDataDefaultValuesFromExisting } from '@app/web/features/activites/use-cases/cra/individuel/db/getCraIndividuelDataDefaultValuesFromExisting'
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

  const {
    mediateur: { id: mediateurId },
  } = await authenticateMediateur()

  const defaultValues = await getCraIndividuelDataDefaultValuesFromExisting({
    id,
    mediateurId,
  })

  if (defaultValues == null) return notFound()

  const defaultValuesWithoutId = {
    ...defaultValues,
    id: undefined,
    rdvServicePublicId: undefined, // the rdvServicePublicId is not duplicated as it is "owned" by the duplicated activite
  }

  return redirect(
    `/coop/mes-activites/cra/individuel?${
      retour ? `retour=${retour}&` : ''
    }v=${encodeSerializableState(defaultValuesWithoutId)}`,
  )
}

export default DupliquerPage
