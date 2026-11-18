import { redirect } from 'next/navigation'
import { renseignerStructureEmployeuseAction } from '@/app/_actions/inscription/renseigner-structure-employeuse.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { hasInscriptionComplete } from '@/features/authentification/domain/getHomepage'
import { sessionUserHasStructureEmployeuse } from '@/features/authentification/domain/sessionUser'
import { authenticateUser } from '@/features/authentification/implementation/session/authenticateUser'
import RenseignerStructureEmployeusePage from '@/features/inscription/abilities/renseigner-structure-employeuse/ui/pages/RenseignerStructureEmployeusePage'

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

  return (
    <RenseignerStructureEmployeusePage
      save={renseignerStructureEmployeuseAction}
      nextStepPath={nextStepPath}
    />
  )
}

export default RenseignerStructureEmployeusePageRoute
