import type { Metadata } from 'next'
import { metadataTitle } from '@/configuration/projet/metadata-title'
import {
  estConseillerNumerique,
  estCoordinateur,
} from '@/features/authentification/domain/profils-d-utilisateur'
import { getAuthenticatedSessionUser } from '@/features/authentification/implementations/session/session-user.query'
import {
  Coordination,
  Dispositif,
} from '@/features/outils/abilities/lister-mes-outils/domain/index'
import { MesOutilsPage } from '@/features/outils/abilities/lister-mes-outils/ui/pages/MesOutilsPage'
import { statutDuCompteDeLaSession } from '@/features/rdvsp/domain/compte/sante-compte'
import RdvServicePublicStatusTag from '@/features/rdvsp/ui/components/RdvServicePublicStatusTag'
import { rdvWebsiteLink } from '@/features/rdvsp/ui/presenters/liens.presenter'

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
          estCoordinateur(user) ? 'Coordinateur' : 'SansCoordination',
        ),
        dispositif: Dispositif(
          estConseillerNumerique(user)
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
