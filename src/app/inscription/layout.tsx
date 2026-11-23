import { redirect } from 'next/navigation'
import { PropsWithChildren } from 'react'
import {
  getHomepage,
  hasInscriptionComplete,
} from '@/features/authentification/domain/page-d-accueil'
import { authenticateUser } from '@/features/authentification/implementations/session/authenticate-user'
import { InscriptionReserveeAuxUtilisateurs } from '@/features/inscription/ui/pages/InscriptionReserveeAuxUtilisateurs'
import Header from '@/features/navigation/ui/layouts/Header'
import { MiseEnPageInscription } from '@/features/navigation/ui/layouts/MiseEnPageInscription'
import MinimalFooter from '@/features/navigation/ui/slots/MinimalFooter.slot'
import TerminerUsurpationHeaderUserMenuItem from '@/features/utilisateurs/abilities/terminer-l-usurpation/ui/slots/TerminerUsurpationHeaderUserMenuItem.slot'

const InscriptionLayout = async ({ children }: PropsWithChildren) => {
  const user = await authenticateUser()

  if (hasInscriptionComplete(user)) {
    redirect('/coop')
  }

  return (
    <MiseEnPageInscription
      entete={
        <Header
          user={user}
          accueil={getHomepage(user)}
          terminerUsurpation={<TerminerUsurpationHeaderUserMenuItem />}
          variant="coop"
        />
      }
      piedDePage={<MinimalFooter />}
    >
      {user.role === 'Admin' || user.role === 'Support' ? (
        <InscriptionReserveeAuxUtilisateurs />
      ) : (
        children
      )}
    </MiseEnPageInscription>
  )
}

export default InscriptionLayout
