import React from 'react'
import CreateCraModal from '@/features/activites/ui/saisie/modale-de-saisie/CreateCraModal'
import { getHomepage } from '@/features/authentification/domain/page-d-accueil'
import { authenticateUser } from '@/features/authentification/implementations/session/authenticate-user'
import Header from '@/features/navigation/ui/en-tete/Header'
import MinimalFooter from '@/features/navigation/ui/pied-de-page/MinimalFooter'
import TerminerUsurpationHeaderUserMenuItem from '@/features/utilisateurs/abilities/terminer-l-usurpation/ui/TerminerUsurpationHeaderUserMenuItem'

const CoopFullWidthLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const user = await authenticateUser()
  return (
    <div className="fr-layout__inner">
      <Header
        user={user}
        accueil={getHomepage(user)}
        terminerUsurpation={<TerminerUsurpationHeaderUserMenuItem />}
        fullWidth
        variant="coop"
      />
      <div className="fr-layout__main">{children}</div>
      <CreateCraModal
        isCoordinateur={user.coordinateur?.id != null}
        isMediateur={user.mediateur?.id != null}
      />
      <MinimalFooter />
    </div>
  )
}

export default CoopFullWidthLayout
