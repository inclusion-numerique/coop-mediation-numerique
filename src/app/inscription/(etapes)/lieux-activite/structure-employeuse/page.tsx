import { redirect } from 'next/navigation'
import { metadataTitle } from '@/app/metadataTitle'
import { authenticateUser } from '@/auth/authenticateUser'
import StructureEmployeuseLieuActivitePage from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/ui/pages/StructureEmployeuseLieuActivitePage'
import { employeuseActuelleAdaptee } from '@/features/inscription/acl/employeuse-actuelle.adapter'
import { hasInscriptionComplete } from '@/security/getHomepage'

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
