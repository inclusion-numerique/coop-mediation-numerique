import { redirect } from 'next/navigation'
import { metadataTitle } from '@/configuration/projet'
import { aTermineSonInscription } from '@/features/authentification/domain/page-d-accueil'
import { authenticateUser } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import StructureAdministrativeCard from '@/features/employeuse/ui/slots/StructureAdministrativeCard.slot'
import VerifierInformationsPage from '@/features/inscription/abilities/verifier-informations/ui/pages/VerifierInformationsPage'
import { donneesDeVerifierInformations } from '@/features/inscription/abilities/verifier-informations/ui/presenters/verifier-informations.presenter'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle('Vérifier vos informations'),
}

const VerifierInformationsPageRoute = async () => {
  const user = await authenticateUser()

  // If inscription is already complete (validated with a role profile), redirect to coop
  if (aTermineSonInscription(user)) {
    redirect('/coop')
  }

  const data = donneesDeVerifierInformations(user)

  return (
    <VerifierInformationsPage
      data={data}
      carteEmployeuse={
        data.structureEmployeuse && (
          <StructureAdministrativeCard structure={data.structureEmployeuse} />
        )
      }
    />
  )
}

export default VerifierInformationsPageRoute
