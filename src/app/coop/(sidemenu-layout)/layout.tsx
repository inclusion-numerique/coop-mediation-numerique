import React from 'react'
import CreateCraModal from '@/features/activites/ui/saisie/CreateCraModal/CreateCraModal'
import { authenticateUser } from '@/features/authentification/implementation/session/authenticateUser'
import Header from '@/features/navigation/ui/en-tete/Header'
import CoopSideMenu from '@/features/navigation/ui/menus/CoopSideMenu'
import MinimalFooter from '@/features/navigation/ui/pied-de-page/MinimalFooter'

const CoopSidemenuLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const user = await authenticateUser()
  return (
    <>
      <Header user={user} fullWidth variant="coop" />
      <div className="fr-flex fr-direction-column fr-direction-md-row">
        <div className="sideMenu">
          <CoopSideMenu user={user} />
        </div>
        <div className="fr-px-20v fr-pb-24v fr-width-full fr-flex-grow-1 fr-overflow-scroll">
          {children}
        </div>
      </div>
      <CreateCraModal
        isMediateur={user.mediateur?.id != null}
        isCoordinateur={user.coordinateur?.id != null}
      />
      <MinimalFooter />
    </>
  )
}

export default CoopSidemenuLayout
