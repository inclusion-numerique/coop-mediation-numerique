import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import { getInscriptionRecapitulatifPageData } from '@app/web/features/inscription/use-cases/recapitulatif/getInscriptionRecapitulatifPageData'
import RecapitulatifPage from '@app/web/features/inscription/use-cases/recapitulatif/RecapitulatifPage'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle('Récapitulatif de votre inscription'),
}

const RecapitulatifPageRoute = async () => {
  const user = await authenticateUser()

  // If inscription is already validated, redirect to coop
  if (user.inscriptionValidee) {
    redirect('/coop')
  }

  const data = await getInscriptionRecapitulatifPageData({
    user,
  })

  return <RecapitulatifPage data={data} />
}

export default RecapitulatifPageRoute
