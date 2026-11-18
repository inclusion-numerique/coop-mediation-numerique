import React from 'react'
import CoopSideMenu from '@/app/coop/CoopSideMenu'
import MinimalFooter from '@/app/coop/MinimalFooter'
import { authenticateUser } from '@/auth/authenticateUser'
import Header from '@/components/Header'
import CreateCraModal from '@/features/activites/ui/saisie/CreateCraModal/CreateCraModal'

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
