import { conseillerNumeriqueInscriptionSteps } from '@app/web/app/inscription/(steps)/conseiller-numerique/conseillerNumeriqueinscriptionSteps'
import InscriptionCard from '@app/web/app/inscription/(steps)/InscriptionCard'
import { mediateurinscriptionStepsCount } from '@app/web/app/inscription/(steps)/mediateur/mediateurinscriptionSteps'
import { getLieuxActiviteForInscription } from '@app/web/app/inscription/getLieuxActiviteForInscription'
import LieuxActiviteForm from '@app/web/app/inscription/LieuxActiviteForm'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import { redirect } from 'next/navigation'

export const metadata = {
  title: metadataTitle('Finaliser mon inscription'),
}

const Page = async () => {
  const user = await authenticateUser()

  if (!user.mediateur || !user.mediateur.conseillerNumerique) {
    redirect('/')
    return null
  }

  const lieuxActivite = await getLieuxActiviteForInscription({
    mediateurId: user.mediateur.id,
  })

  return (
    <InscriptionCard
      title="Renseignez vos lieux d’activité"
      backHref={conseillerNumeriqueInscriptionSteps.recapitulatif}
      nextStepTitle="Récapitulatif de vos informations"
      stepNumber={2}
      totalSteps={mediateurinscriptionStepsCount}
      subtitle="Vos lieux d’activité sont les lieux où vous accueillez et accompagnez vos bénéficiaires (e.g. : lieu de permanence...)"
    >
      <LieuxActiviteForm
        nextHref={conseillerNumeriqueInscriptionSteps.recapitulatif}
        createStructureBackHref={
          conseillerNumeriqueInscriptionSteps.lieuxActivite
        }
        defaultValues={{
          lieuxActivite,
          userId: user.id,
        }}
      />
    </InscriptionCard>
  )
}

export default Page
