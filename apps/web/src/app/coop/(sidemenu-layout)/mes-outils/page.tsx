import { metadataTitle } from '@app/web/app/metadataTitle'
import { getAuthenticatedSessionUser } from '@app/web/auth/getSessionUser'
import {
  isConseillerNumerique,
  isCoordinateur,
} from '@app/web/auth/userTypeGuards'
import { MesOutilsPage } from '@app/web/features/outils/abilities/lister-mes-outils/ui'
import RdvServicePublicStatusTag from '@app/web/features/rdvsp/ui/RdvServicePublicStatusTag'
import { rdvWebsiteLink } from '@app/web/features/rdvsp/urls'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: metadataTitle('Mes outils'),
}

const Page = async () => {
  const user = await getAuthenticatedSessionUser()
  const statutRdv = user.rdvAccount?.statut ?? 'jamaisConnecte'

  return (
    <MesOutilsPage
      profil={{
        coordinateur: isCoordinateur(user),
        conseillerNumerique: isConseillerNumerique(user),
      }}
      rdvServicePublic={{
        lien: rdvWebsiteLink,
        integrationDisponible: statutRdv === 'jamaisConnecte',
        etiquette:
          statutRdv === 'jamaisConnecte' ? null : (
            <RdvServicePublicStatusTag status={statutRdv} />
          ),
      }}
    />
  )
}

export default Page
