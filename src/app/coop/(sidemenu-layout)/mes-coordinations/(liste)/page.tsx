import type { Metadata } from 'next'
import { supprimerUneActiviteDeCoordinationAction } from '@/app/_actions/activites/supprimer-une-activite-de-coordination.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { requeteDeLExport } from '@/features/activites/abilities/exporter-les-activites-de-coordination/ui/search-params/requete-de-l-export.search-params'
import { BoutonExporter } from '@/features/activites/abilities/exporter-les-activites-de-coordination/ui/slots/BoutonExporter.slot'
import { SUPPRIMER_LA_COORDINATION_KEY } from '@/features/activites/abilities/lister-les-activites-de-coordination/action/supprimer-la-coordination.key'
import { listerLesActivitesDeCoordination } from '@/features/activites/abilities/lister-les-activites-de-coordination/implementations/prisma/activites-de-coordination.query'
import { optionsDeFiltre } from '@/features/activites/abilities/lister-les-activites-de-coordination/implementations/prisma/options-de-filtre.query'
import { MesCoordinationsPage } from '@/features/activites/abilities/lister-les-activites-de-coordination/ui/pages/MesCoordinationsPage'
import { mesActivitesDeCoordination } from '@/features/activites/abilities/lister-les-activites-de-coordination/ui/presenters/page-de-mes-coordinations.presenter'
import { isMediateur } from '@/features/authentification/domain/profils-d-utilisateur'
import { authenticateCoordinateur } from '@/features/authentification/implementations/session/authenticate-user'
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
    lectures: {
      activites: listerLesActivitesDeCoordination,
      options: optionsDeFiltre,
    },
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
