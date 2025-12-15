import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import { getStructureEmployeuseForInscription } from '@app/web/features/inscription/getStructureEmployeuseForInscription'
import StructureEmployeuseLieuActivitePage from '@app/web/features/inscription/use-cases/lieux-activite/StructureEmployeuseLieuActivitePage'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle("Renseigner vos lieux d'activité"),
}

const StructureEmployeuseLieuxActivitePageRoute = async () => {
  const user = await authenticateUser()

  // If inscription is already validated, redirect to coop
  if (user.inscriptionValidee) {
    redirect('/coop')
  }

  if (!user.mediateur) {
    redirect('/inscription/initialiser')
  }

  // User must have an emploi (structure employeuse)
  const emploi = await getStructureEmployeuseForInscription({
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
      userId={user.id}
      structureEmployeuse={structureEmployeuse}
    />
  )
}

export default StructureEmployeuseLieuxActivitePageRoute
