import type { Metadata } from 'next'
import { supprimerBeneficiairesAction } from '@/app/_actions/beneficiaire/supprimer-beneficiaires.action'
import { metadataTitle } from '@/configuration/projet'
import { authenticateMediateur } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { SUPPRIMER_DES_BENEFICIAIRES_KEY } from '@/features/beneficiaire/abilities/lister-beneficiaires/action/supprimer-des-beneficiaires.key'
import { listerBeneficiaires } from '@/features/beneficiaire/abilities/lister-beneficiaires/implementations/prisma/lister-beneficiaires.query'
import {
  liensDeLaListe,
  requeteDesBeneficiaires,
} from '@/features/beneficiaire/abilities/lister-beneficiaires/ui/filtres/liste-des-beneficiaires.filtre'
import { MesBeneficiairesListePage } from '@/features/beneficiaire/abilities/lister-beneficiaires/ui/pages/MesBeneficiairesListePage'
import { presentMesBeneficiaires } from '@/features/beneficiaire/abilities/lister-beneficiaires/ui/presenters/lister-beneficiaires.presenter'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { ClientBinder } from '@/libraries/nextjs/injection'

export const metadata: Metadata = {
  title: metadataTitle('Mes bénéficiaires'),
}

const MesBeneficiairesPage = async (props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) => {
  const searchParams = await props.searchParams
  const user = await authenticateMediateur()
  const query = requeteDesBeneficiaires(searchParams)
  const beneficiaires = await listerBeneficiaires({
    mediateurId: MediateurId(user.mediateur.id),
    ...query,
    maintenant: new Date(),
  })

  const view = presentMesBeneficiaires(beneficiaires, query.search)

  return (
    <ClientBinder
      bind={SUPPRIMER_DES_BENEFICIAIRES_KEY}
      to={supprimerBeneficiairesAction}
    >
      <MesBeneficiairesListePage
        view={view}
        liens={liensDeLaListe(searchParams, beneficiaires)}
      />
    </ClientBinder>
  )
}

export default MesBeneficiairesPage
