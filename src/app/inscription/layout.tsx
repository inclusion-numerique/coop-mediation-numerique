import { redirect } from 'next/navigation'
import { PropsWithChildren } from 'react'
import {
  aTermineSonInscription,
  pageDAccueil,
} from '@/features/authentification/domain/page-d-accueil'
import { authenticateUser } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { InscriptionReserveeAuxUtilisateursPage } from '@/features/inscription/ui/pages/InscriptionReserveeAuxUtilisateursPage'
import { InscriptionLayout } from '@/features/navigation/ui/layouts/InscriptionLayout'
import Header from '@/features/navigation/ui/slots/Header.slot'
import MinimalFooter from '@/features/navigation/ui/slots/MinimalFooter.slot'
import TerminerUsurpationHeaderUserMenuItem from '@/features/utilisateurs/abilities/terminer-l-usurpation/ui/slots/TerminerUsurpationHeaderUserMenuItem.slot'

const Layout = async ({ children }: PropsWithChildren) => {
  const user = await authenticateUser()

  if (aTermineSonInscription(user)) {
    redirect('/coop')
  }

  return (
    <InscriptionLayout
      entete={
        <Header
          user={user}
          accueil={pageDAccueil(user)}
          terminerUsurpation={<TerminerUsurpationHeaderUserMenuItem />}
          variant="coop"
        />
      }
      piedDePage={<MinimalFooter />}
    >
      {user.role === 'Admin' ? (
        <InscriptionReserveeAuxUtilisateursPage />
      ) : (
        children
      )}
    </InscriptionLayout>
  )
}

export default Layout
