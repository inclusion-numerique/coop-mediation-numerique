import React from 'react'
import CreateCraModal from '@/features/activites/ui/saisie/CreateCraModal/CreateCraModal'
import { authenticateUser } from '@/features/authentification/implementation/session/authenticateUser'
import Header from '@/features/navigation/ui/en-tete/Header'
import MinimalFooter from '@/features/navigation/ui/pied-de-page/MinimalFooter'

const CoopFullWidthLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const user = await authenticateUser()
  return (
    <div className="fr-layout__inner">
      <Header user={user} fullWidth variant="coop" />
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
