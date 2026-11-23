import { redirect } from 'next/navigation'
import { rechercherStructureEmployeuseAction } from '@/app/_actions/employeuse/rechercher-structure-employeuse.action'
import { renseignerStructureEmployeuseAction } from '@/app/_actions/inscription/renseigner-structure-employeuse.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { hasInscriptionComplete } from '@/features/authentification/domain/page-d-accueil'
import { sessionUserHasStructureEmployeuse } from '@/features/authentification/domain/utilisateur-de-la-session'
import { authenticateUser } from '@/features/authentification/implementations/session/authenticateUser'
import { RECHERCHER_STRUCTURE_EMPLOYEUSE_ACTION_KEY } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/action/rechercher-structure-employeuse.key'
import { RENSEIGNER_STRUCTURE_EMPLOYEUSE_ACTION_KEY } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/action/renseigner-structure-employeuse.key'
import RattacherEmployeuseForm from '@/features/employeuse/abilities/rattacher-a-une-employeuse/ui/RattacherEmployeuseForm'
import RenseignerStructureEmployeusePage from '@/features/inscription/abilities/renseigner-structure-employeuse/ui/pages/RenseignerStructureEmployeusePage'
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

  return (
    <RenseignerStructureEmployeusePage
      formulaire={
        <ClientBinder
          bind={RENSEIGNER_STRUCTURE_EMPLOYEUSE_ACTION_KEY}
          to={renseignerStructureEmployeuseAction}
        >
          <ClientBinder
            bind={RECHERCHER_STRUCTURE_EMPLOYEUSE_ACTION_KEY}
            to={rechercherStructureEmployeuseAction}
          >
            <RattacherEmployeuseForm nextStepPath="/inscription/lieux-activite/structure-employeuse" />
          </ClientBinder>
        </ClientBinder>
      }
    />
  )
}

export default RenseignerStructureEmployeusePageRoute
