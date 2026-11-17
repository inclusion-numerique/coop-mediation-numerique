import { rechercherUnLieuActiviteAction } from '@app/web/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import { getRecapitulatifPageData } from '@app/web/features/inscription/abilities/valider/queries/getRecapitulatifPageData'
import RecapitulatifPage from '@app/web/features/inscription/abilities/valider/ui/pages/RecapitulatifPage'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@app/web/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import { hasInscriptionComplete } from '@app/web/security/getHomepage'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle('Récapitulatif de votre inscription'),
}

const RecapitulatifPageRoute = async () => {
  const user = await authenticateUser()

  // If inscription is already complete (validated with a role profile), redirect to coop
  if (hasInscriptionComplete(user)) {
    redirect('/coop')
  }

  const data = await getRecapitulatifPageData({
    user,
  })

  return (
    <ClientBinder
      bind={RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY}
      to={rechercherUnLieuActiviteAction}
    >
      <RecapitulatifPage data={data} />
    </ClientBinder>
  )
}

export default RecapitulatifPageRoute
