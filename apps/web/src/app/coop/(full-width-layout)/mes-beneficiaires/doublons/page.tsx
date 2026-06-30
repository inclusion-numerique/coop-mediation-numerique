import { metadataTitle } from '@app/web/app/metadataTitle'
import { getSessionUser } from '@app/web/auth/getSessionUser'
import { detecterDoublons } from '@app/web/features/beneficiaire/abilities/detecter-doublons/implementation'
import BeneficiairesDoublonsPage from '@app/web/features/beneficiaire/abilities/detecter-doublons/ui/pages/BeneficiairesDoublonsPage'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: metadataTitle('Mes bénéficiaires - Doublons'),
}

const Page = async () => {
  const user = await getSessionUser()
  if (!user) {
    notFound()
  }

  const data = user.mediateur
    ? await detecterDoublons({ mediateurId: MediateurId(user.mediateur.id) })
    : { count: 0, duplicates: [] }

  return <BeneficiairesDoublonsPage data={data} />
}

export default Page
