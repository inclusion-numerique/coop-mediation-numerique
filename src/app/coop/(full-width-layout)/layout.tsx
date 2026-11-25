import React from 'react'
import CreateCraModal from '@/features/activites/ui/slots/CreateCraModal.slot'
import { pageDAccueil } from '@/features/authentification/domain/page-d-accueil'
import { authenticateUser } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { CoopPleineLargeurLayout } from '@/features/navigation/ui/layouts/CoopPleineLargeurLayout'
import Header from '@/features/navigation/ui/slots/Header.slot'
import MinimalFooter from '@/features/navigation/ui/slots/MinimalFooter.slot'
import TerminerUsurpationHeaderUserMenuItem from '@/features/utilisateurs/abilities/terminer-l-usurpation/ui/slots/TerminerUsurpationHeaderUserMenuItem.slot'

const CoopFullWidthLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const user = await authenticateUser()
  return (
    <CoopPleineLargeurLayout
      entete={
        <Header
          user={user}
          accueil={pageDAccueil(user)}
          terminerUsurpation={<TerminerUsurpationHeaderUserMenuItem />}
          fullWidth
          variant="coop"
        />
      }
      modales={
        <CreateCraModal
          isCoordinateur={user.coordinateur?.id != null}
          isMediateur={user.mediateur?.id != null}
        />
      }
      piedDePage={<MinimalFooter />}
    >
      {children}
    </CoopPleineLargeurLayout>
  )
}

export default CoopFullWidthLayout
