import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fusionnerBeneficiairesAction } from '@/app/_actions/beneficiaire/fusionner-beneficiaires.action'
import { metadataTitle } from '@/configuration/projet/metadata-title'
import { getSessionUser } from '@/features/authentification/implementations/session/session-user.query'
import { FUSIONNER_DES_BENEFICIAIRES_KEY } from '@/features/beneficiaire/abilities/detecter-doublons/action/fusionner-des-beneficiaires.key'
import { detecterDoublons } from '@/features/beneficiaire/abilities/detecter-doublons/implementations/prisma/index'
import BeneficiairesDoublonsPage from '@/features/beneficiaire/abilities/detecter-doublons/ui/pages/BeneficiairesDoublonsPage'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

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

  return (
    <ClientBinder
      bind={FUSIONNER_DES_BENEFICIAIRES_KEY}
      to={fusionnerBeneficiairesAction}
    >
      <BeneficiairesDoublonsPage data={data} />
    </ClientBinder>
  )
}

export default Page
