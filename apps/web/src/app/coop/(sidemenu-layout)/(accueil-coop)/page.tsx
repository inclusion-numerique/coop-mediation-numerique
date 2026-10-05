import { rafraichirAccueilRdvAction } from '@app/web/app/_actions/rdvsp/rafraichir-accueil-rdv.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@app/web/auth/authenticateUser'
import { getAccueilPageDataFor } from '@app/web/features/accueil/accueil-page-data.query'
import { nouvellesFonctionnalitesMasquees } from '@app/web/features/accueil/nouvelles-fonctionnalites/nouvellesFonctionnalitesMasquees'
import { Accueil } from '@app/web/features/accueil/ui/pages/Accueil'
import { RAFRAICHIR_ACCUEIL_RDV_ACTION_KEY } from '@app/web/features/rdvsp/abilities/consulter-rdvs-accueil/action/rafraichir-accueil-rdv.key'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: metadataTitle('Accueil'),
}

const Page = async () => {
  const { id: userId, ...user } = await authenticateMediateurOrCoordinateur()

  const dashboardPageData = await getAccueilPageDataFor({ ...user, id: userId })

  return (
    <ClientBinder
      bind={RAFRAICHIR_ACCUEIL_RDV_ACTION_KEY}
      to={rafraichirAccueilRdvAction}
    >
      <Accueil
        {...user}
        userId={userId}
        {...dashboardPageData}
        isMediateur={user.mediateur?.id != null}
        isCoordinateur={user.coordinateur?.id != null}
        nouvellesFonctionnalitesMasquees={
          await nouvellesFonctionnalitesMasquees()
        }
      />
    </ClientBinder>
  )
}

export default Page
