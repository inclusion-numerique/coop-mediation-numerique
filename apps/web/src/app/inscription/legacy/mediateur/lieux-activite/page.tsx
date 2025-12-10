import InscriptionCard from '@app/web/features/inscription/components/InscriptionCard'
import {
  mediateurInscriptionSteps,
  mediateurinscriptionStepsCount,
} from '@app/web/app/inscription/legacy/mediateur/mediateurinscriptionSteps'
import { getLieuxActiviteForInscription } from '@app/web/app/inscription/getLieuxActiviteForInscription'
import LieuxActiviteForm from '@app/web/app/inscription/LieuxActiviteForm'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import { redirect } from 'next/navigation'

export const metadata = {
  title: metadataTitle('Finaliser mon inscription'),
}

// next js query params "profil": ProfilInscription
const Page = async () => {
  const user = await authenticateUser()

  if (!user.mediateur) {
    redirect('/')
  }

  if (user.emplois.length === 0) {
    redirect(mediateurInscriptionSteps.structureEmployeuse)
  }

  const lieuxActivite = await getLieuxActiviteForInscription({
    mediateurId: user.mediateur.id,
  })

  return (
    <InscriptionCard
      title="Renseignez vos lieux d’activité"
      backHref={mediateurInscriptionSteps.structureEmployeuse}
      nextStepTitle="Récapitulatif de vos informations"
      stepNumber={2}
      totalSteps={mediateurinscriptionStepsCount}
    >
      <LieuxActiviteForm
        nextHref={mediateurInscriptionSteps.recapitulatif}
        createStructureBackHref={mediateurInscriptionSteps.lieuxActivite}
        defaultValues={{
          lieuxActivite,
          userId: user.id,
        }}
      />
    </InscriptionCard>
  )
}

export default Page
