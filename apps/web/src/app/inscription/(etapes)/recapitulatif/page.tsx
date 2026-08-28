import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import { getRecapitulatifPageData } from '@app/web/features/inscription/abilities/valider/queries/getRecapitulatifPageData'
import RecapitulatifPage from '@app/web/features/inscription/abilities/valider/ui/pages/RecapitulatifPage'
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

  return <RecapitulatifPage data={data} />
}

export default RecapitulatifPageRoute
