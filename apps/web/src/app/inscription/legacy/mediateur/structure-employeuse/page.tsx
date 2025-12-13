import { StructureEmployeusePage } from '@app/web/app/inscription/legacy/_components/structure-employeuse/StructureEmployeusePage'
import {
  mediateurInscriptionSteps,
  mediateurinscriptionStepsCount,
} from '@app/web/app/inscription/legacy/mediateur/mediateurinscriptionSteps'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import { redirect } from 'next/navigation'

export const metadata = {
  title: metadataTitle('Structure employeuse - Finaliser mon inscription'),
}

const Page = async () => {
  const user = await authenticateUser()

  if (!user.mediateur) {
    redirect('/')
  }

  return (
    <StructureEmployeusePage
      backHref={mediateurInscriptionSteps.intro}
      nextStepTitle="Renseignez vos lieux d’activité"
      nextStep={mediateurInscriptionSteps.structureEmployeuseLieuActivite}
      totalSteps={mediateurinscriptionStepsCount}
    />
  )
}

export default Page
