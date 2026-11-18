import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { metadataTitle } from '@/app/metadataTitle'
import { getSessionUser } from '@/auth/getSessionUser'
import { detecterDoublons } from '@/features/beneficiaire/abilities/detecter-doublons/implementation'
import BeneficiairesDoublonsPage from '@/features/beneficiaire/abilities/detecter-doublons/ui/pages/BeneficiairesDoublonsPage'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'

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
