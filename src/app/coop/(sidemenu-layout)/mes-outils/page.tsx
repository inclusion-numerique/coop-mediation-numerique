import type { Metadata } from 'next'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import {
  isConseillerNumerique,
  isCoordinateur,
} from '@/features/authentification/domain/profils-d-utilisateur'
import { getAuthenticatedSessionUser } from '@/features/authentification/implementations/session/getSessionUser'
import {
  Coordination,
  Dispositif,
} from '@/features/outils/abilities/lister-mes-outils'
import { MesOutilsPage } from '@/features/outils/abilities/lister-mes-outils/ui'
import { statutDuCompteDeLaSession } from '@/features/rdvsp/domain/sante-compte'
import RdvServicePublicStatusTag from '@/features/rdvsp/ui/RdvServicePublicStatusTag'
import { rdvWebsiteLink } from '@/features/rdvsp/ui/urls'

export const metadata: Metadata = {
  title: metadataTitle('Mes outils'),
}

const Page = async () => {
  const user = await getAuthenticatedSessionUser()
  const statutRdv = statutDuCompteDeLaSession(user.rdvAccount)

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
