import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import LieuxActivitePage from '@app/web/features/inscription/abilities/renseigner-lieux-activite/ui/pages/LieuxActivitePage'
import { getLieuxActiviteForInscription } from '@app/web/features/inscription/getLieuxActiviteForInscription'
import { hasInscriptionComplete } from '@app/web/security/getHomepage'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle('Renseigner vos lieux d’activité'),
}

const LieuxActivitePageRoute = async () => {
  const user = await authenticateUser()

  // If inscription is already complete (validated with a role profile), redirect to coop
  if (hasInscriptionComplete(user)) {
    redirect('/coop')
  }

  if (!user.mediateur) {
    redirect('/inscription/initialiser')
  }

  // Get existing lieux if any
  const lieuxActivite = await getLieuxActiviteForInscription({
    mediateurId: user.mediateur.id,
  })

  return <LieuxActivitePage userId={user.id} lieuxActivite={lieuxActivite} />
}

export default LieuxActivitePageRoute
