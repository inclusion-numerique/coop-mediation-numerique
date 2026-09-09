import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import StructureEmployeuseLieuActivitePage from '@app/web/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/ui/pages/StructureEmployeuseLieuActivitePage'
import { employeuseActuelleAdaptee } from '@app/web/features/inscription/acl/employeuse-actuelle.adapter'
import { hasInscriptionComplete } from '@app/web/security/getHomepage'
import { redirect } from 'next/navigation'

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
  const emploi = await employeuseActuelleAdaptee({
    userId: user.id,
  })

  if (!emploi) {
    // No structure employeuse, skip this step
    redirect('/inscription/lieux-activite')
  }

  const structureEmployeuse = {
    ...emploi.structure,
    siret: emploi.structure.siret ?? '',
    codeInsee: emploi.structure.codeInsee ?? '',
  }

  return (
    <StructureEmployeuseLieuActivitePage
      structureEmployeuse={structureEmployeuse}
    />
  )
}

export default StructureEmployeuseLieuxActivitePageRoute
