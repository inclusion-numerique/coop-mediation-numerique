import { redirect } from 'next/navigation'
import { ajouterStructureEmployeuseEnLieuAction } from '@/app/_actions/inscription/ajouter-structure-employeuse-en-lieu.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { hasInscriptionComplete } from '@/features/authentification/domain/getHomepage'
import { authenticateUser } from '@/features/authentification/implementations/session/authenticateUser'
import {
  consulterEmployeuseActuelle,
  employeuseActuelleAffichage,
} from '@/features/employeuse/server'
import StructureAdministrativeCard from '@/features/employeuse/ui/StructureAdministrativeCard'
import { AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ACTION_KEY } from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/action/ajouter-structure-employeuse-en-lieu.key'
import StructureEmployeuseLieuActivitePage from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/ui/pages/StructureEmployeuseLieuActivitePage'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle("Renseigner vos lieux d'activité"),
}

const StructureEmployeuseLieuxActivitePageRoute = async () => {
  const user = await authenticateUser()

  // If inscription is already complete (validated with a role profile), redirect to coop
  if (hasInscriptionComplete(user)) {
    redirect('/coop')
  }

  if (!user.mediateur) {
    redirect('/inscription/initialiser')
  }

  // User must have an emploi (structure employeuse)
  const employeuseActuelle = await consulterEmployeuseActuelle({
    userId: user.id,
  })

  if (!employeuseActuelle) {
    // No structure employeuse, skip this step
    redirect('/inscription/lieux-activite')
  }

  return (
    <ClientBinder
      bind={AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ACTION_KEY}
      to={ajouterStructureEmployeuseEnLieuAction}
    >
      <StructureEmployeuseLieuActivitePage
        carteEmployeuse={
          <StructureAdministrativeCard
            structure={employeuseActuelleAffichage(employeuseActuelle)}
          />
        }
      />
    </ClientBinder>
  )
}

export default StructureEmployeuseLieuxActivitePageRoute
