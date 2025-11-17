import { metadataTitle } from '@app/web/app/metadataTitle'
import { getSessionUser } from '@app/web/auth/getSessionUser'
import BeneficiairesDoublonsPage from '@app/web/features/beneficiaires/use-cases/doublons/components/BeneficiairesDoublonsPage'
import { getBeneficiairesDoublonsPageData } from '@app/web/features/beneficiaires/use-cases/doublons/getBeneficiairesDoublonsPageData'
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

  const data = await getBeneficiairesDoublonsPageData({ user })

  return <BeneficiairesDoublonsPage data={data} />
}

export default Page
