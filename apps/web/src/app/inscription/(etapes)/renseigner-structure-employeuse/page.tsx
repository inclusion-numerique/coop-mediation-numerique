import { renseignerStructureEmployeuseAction } from '@app/web/app/_actions/inscription/renseigner-structure-employeuse.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import { sessionUserHasStructureEmployeuse } from '@app/web/auth/sessionUser'
import RenseignerStructureEmployeusePage from '@app/web/features/inscription/abilities/renseigner-structure-employeuse/ui/pages/RenseignerStructureEmployeusePage'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle('Renseigner votre structure employeuse'),
}

const RenseignerStructureEmployeusePageRoute = async () => {
  const user = await authenticateUser()

  if (user.inscriptionValidee) {
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
