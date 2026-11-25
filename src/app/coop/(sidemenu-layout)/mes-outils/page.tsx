import type { Metadata } from 'next'
import { estMain, metadataTitle } from '@/configuration/projet'
import {
  estConseillerNumerique,
  estCoordinateur,
} from '@/features/authentification/domain/profils-d-utilisateur'
import { getAuthenticatedSessionUser } from '@/features/authentification/middlewares/with-utilisateur-de-la-session'
import {
  Coordination,
  Dispositif,
} from '@/features/outils/abilities/lister-mes-outils/domain/index'
import { MesOutilsPage } from '@/features/outils/abilities/lister-mes-outils/ui/pages/MesOutilsPage'
import { statutDuCompteDeLaSession } from '@/features/rdvsp/domain/compte/sante-compte'
import { lienDuSiteRdv } from '@/features/rdvsp/ui/presenters/liens.presenter'
import EtiquetteDuCompteRdv from '@/features/rdvsp/ui/slots/EtiquetteDuCompteRdv.slot'

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
        lien: lienDuSiteRdv(estMain()),
        integrationDisponible: statutRdv === 'jamaisConnecte',
        etiquette:
          statutRdv === 'jamaisConnecte' ? null : (
            <EtiquetteDuCompteRdv status={statutRdv} />
          ),
      }}
    />
  )
}

export default Page
