import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import { getInscriptionRecapitulatifPageData } from '@app/web/features/inscription/use-cases/recapitulatif/getInscriptionRecapitulatifPageData'
import RecapitulatifPage from '@app/web/features/inscription/use-cases/recapitulatif/RecapitulatifPage'
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

  const data = await getInscriptionRecapitulatifPageData({
    user,
  })

  return <RecapitulatifPage data={data} />
}

export default RecapitulatifPageRoute
