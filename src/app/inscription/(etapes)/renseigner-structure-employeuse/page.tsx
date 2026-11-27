import { redirect } from 'next/navigation'
import { rechercherStructureEmployeuseAction } from '@/app/_actions/employeuse/rechercher-structure-employeuse.action'
import { renseignerStructureEmployeuseAction } from '@/app/_actions/inscription/renseigner-structure-employeuse.action'
import { metadataTitle } from '@/configuration/projet'
import { aTermineSonInscription } from '@/features/authentification/domain/page-d-accueil'
import { aUneStructureEmployeuse } from '@/features/authentification/domain/utilisateur-de-la-session'
import { authenticateUser } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { RECHERCHER_UNE_STRUCTURE_EMPLOYEUSE_ACTION_KEY } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/action/rechercher-une-structure-employeuse.key'
import { RENSEIGNER_STRUCTURE_EMPLOYEUSE_ACTION_KEY } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/action/renseigner-structure-employeuse.key'
import RattacherEmployeuseForm from '@/features/employeuse/abilities/rattacher-a-une-employeuse/ui/slots/RattacherEmployeuseForm.slot'
import RenseignerStructureEmployeusePage from '@/features/inscription/abilities/renseigner-structure-employeuse/ui/pages/RenseignerStructureEmployeusePage'
import { ClientBinder } from '@/libraries/nextjs/injection'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle('Renseigner votre structure employeuse'),
}

const RenseignerStructureEmployeusePageRoute = async () => {
  const user = await authenticateUser()

  if (aTermineSonInscription(user)) {
    redirect('/coop')
  }

  if (aUneStructureEmployeuse(user)) {
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
            bind={RECHERCHER_UNE_STRUCTURE_EMPLOYEUSE_ACTION_KEY}
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
