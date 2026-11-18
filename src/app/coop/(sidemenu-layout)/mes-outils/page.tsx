import type { Metadata } from 'next'
import { metadataTitle } from '@/app/metadataTitle'
import { getAuthenticatedSessionUser } from '@/auth/getSessionUser'
import { isConseillerNumerique, isCoordinateur } from '@/auth/userTypeGuards'
import {
  Coordination,
  Dispositif,
} from '@/features/outils/abilities/lister-mes-outils'
import { MesOutilsPage } from '@/features/outils/abilities/lister-mes-outils/ui'
import RdvServicePublicStatusTag from '@/features/rdvsp/ui/RdvServicePublicStatusTag'
import { rdvWebsiteLink } from '@/features/rdvsp/urls'

export const metadata: Metadata = {
  title: metadataTitle('Mes outils'),
}

const Page = async () => {
  const user = await getAuthenticatedSessionUser()
  const statutRdv = user.rdvAccount?.statut ?? 'jamaisConnecte'

  return (
    <MesOutilsPage
      profil={{
        coordination: Coordination(
          isCoordinateur(user) ? 'Coordinateur' : 'SansCoordination',
        ),
        dispositif: Dispositif(
          isConseillerNumerique(user)
            ? 'ConseillerNumerique'
            : 'HorsDispositif',
        ),
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
