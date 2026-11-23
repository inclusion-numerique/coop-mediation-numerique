import type { Metadata } from 'next'
import { supprimerUneActiviteDeCoordinationAction } from '@/app/_actions/activites/supprimer-une-activite-de-coordination.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import {
  BoutonExporter,
  requeteDeLExport,
} from '@/features/activites/abilities/exporter-les-activites-de-coordination/ui'
import { mesActivitesDeCoordination } from '@/features/activites/abilities/lister-les-activites-de-coordination'
import { MesCoordinationsPage } from '@/features/activites/abilities/lister-les-activites-de-coordination/ui'
import { SUPPRIMER_LA_COORDINATION_KEY } from '@/features/activites/abilities/lister-les-activites-de-coordination/ui/supprimer-la-coordination.key'
import { isMediateur } from '@/features/authentification/domain/userTypeGuards'
import { authenticateCoordinateur } from '@/features/authentification/implementation/session/authenticateUser'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

export const metadata: Metadata = {
  title: metadataTitle('Mes activités de coordination'),
}

type Parametres = {
  page?: string
  lignes?: string
  du?: string
  au?: string
  types?: string
  tags?: string
}

const MesCoordinationsRoute = async ({
  searchParams,
}: {
  searchParams: Promise<Parametres>
}) => {
  const user = await authenticateCoordinateur()
  const parametres = await searchParams

  const { page, total } = await mesActivitesDeCoordination({
    coordinateurId: user.coordinateur.id,
    parametres,
    timezone: user.timezone,
    aussiMediateur: isMediateur(user),
  })

  return (
    <ClientBinder
      bind={SUPPRIMER_LA_COORDINATION_KEY}
      to={supprimerUneActiviteDeCoordinationAction}
    >
      <MesCoordinationsPage
        {...page}
        exporter={
          <BoutonExporter
            filters={page.filtresActifs}
            requete={requeteDeLExport(parametres)}
            activitesCount={total}
          />
        }
      />
    </ClientBinder>
  )
}

export default MesCoordinationsRoute
