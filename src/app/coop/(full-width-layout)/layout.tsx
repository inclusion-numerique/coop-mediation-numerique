import React from 'react'
import MinimalFooter from '@/app/coop/MinimalFooter'
import { authenticateUser } from '@/auth/authenticateUser'
import Header from '@/components/Header'
import CreateCraModal from '@/features/activites/ui/saisie/CreateCraModal/CreateCraModal'

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
