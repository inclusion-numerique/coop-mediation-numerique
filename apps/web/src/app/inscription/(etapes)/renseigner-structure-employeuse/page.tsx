import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import { sessionUserHasStructureEmployeuse } from '@app/web/auth/sessionUser'
import RenseignerStructureEmployeusePage from '@app/web/features/inscription/use-cases/renseigner-structure-employeuse/RenseignerStructureEmployeusePage'
import { hasInscriptionComplete } from '@app/web/security/getHomepage'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle('Renseigner votre structure employeuse'),
}

const RenseignerStructureEmployeusePageRoute = async () => {
  const user = await authenticateUser()

  if (hasInscriptionComplete(user)) {
    redirect('/coop')
  }

  if (sessionUserHasStructureEmployeuse(user)) {
    redirect('/inscription/lieux-activite/structure-employeuse')
  }

  const nextStepPath = '/inscription/lieux-activite/structure-employeuse'

  return <RenseignerStructureEmployeusePage nextStepPath={nextStepPath} />
}

export default RenseignerStructureEmployeusePageRoute
