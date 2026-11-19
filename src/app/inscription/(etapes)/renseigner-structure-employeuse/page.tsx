import { redirect } from 'next/navigation'
import { rechercherStructureEmployeuseAction } from '@/app/_actions/employeuse/rechercher-structure-employeuse.action'
import { renseignerStructureEmployeuseAction } from '@/app/_actions/inscription/renseigner-structure-employeuse.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { hasInscriptionComplete } from '@/features/authentification/domain/getHomepage'
import { sessionUserHasStructureEmployeuse } from '@/features/authentification/domain/sessionUser'
import { authenticateUser } from '@/features/authentification/implementation/session/authenticateUser'
import RenseignerStructureEmployeusePage from '@/features/inscription/abilities/renseigner-structure-employeuse/ui/pages/RenseignerStructureEmployeusePage'
import { RECHERCHER_UNE_STRUCTURE_EMPLOYEUSE_KEY } from '@/features/inscription/abilities/renseigner-structure-employeuse/ui/rechercher-une-structure-employeuse.key'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

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
    <ClientBinder
      bind={RECHERCHER_UNE_STRUCTURE_EMPLOYEUSE_KEY}
      to={rechercherStructureEmployeuseAction}
    >
      <RenseignerStructureEmployeusePage
        save={renseignerStructureEmployeuseAction}
        nextStepPath={nextStepPath}
      />
    </ClientBinder>
  )
}

export default RenseignerStructureEmployeusePageRoute
