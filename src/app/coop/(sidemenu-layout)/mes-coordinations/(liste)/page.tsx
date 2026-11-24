import type { Metadata } from 'next'
import { supprimerUneActiviteDeCoordinationAction } from '@/app/_actions/activites/supprimer-une-activite-de-coordination.action'
import { rechercherDesTagsAction } from '@/app/_actions/tags/rechercher-des-tags.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { BoutonExporter } from '@/features/activites/abilities/exporter-les-activites-de-coordination/ui/slots/BoutonExporter.slot'
import { SUPPRIMER_LA_COORDINATION_KEY } from '@/features/activites/abilities/lister-les-activites-de-coordination/action/supprimer-la-coordination.key'
import { listerLesActivitesDeCoordination } from '@/features/activites/abilities/lister-les-activites-de-coordination/implementations/prisma/activites-de-coordination.query'
import { optionsDeFiltre } from '@/features/activites/abilities/lister-les-activites-de-coordination/implementations/prisma/options-de-filtre.query'
import { BarreDesCoordinations } from '@/features/activites/abilities/lister-les-activites-de-coordination/ui/components/BarreDesCoordinations'
import { filtresDesCoordinations } from '@/features/activites/abilities/lister-les-activites-de-coordination/ui/filtres/filtres-des-coordinations.filtre'
import { MesCoordinationsPage } from '@/features/activites/abilities/lister-les-activites-de-coordination/ui/pages/MesCoordinationsPage'
import { barreDesCoordinations } from '@/features/activites/abilities/lister-les-activites-de-coordination/ui/presenters/barre-des-coordinations.presenter'
import { mesActivitesDeCoordination } from '@/features/activites/abilities/lister-les-activites-de-coordination/ui/presenters/page-de-mes-coordinations.presenter'
import { tagsChoisis } from '@/features/activites/abilities/lister-les-options-de-filtre-des-activites/implementations/prisma/tags-choisis.query'
import { RECHERCHER_DES_TAGS_DU_CRA_KEY } from '@/features/activites/action/rechercher-des-tags.key'
import { criteresDesFiltresDeCoordination } from '@/features/activites/ui/filtres/coordinations.filtre'
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

  const valeurs = filtresDesCoordinations.charger(parametres)

  const [{ page, total }, tags] = await Promise.all([
    mesActivitesDeCoordination({
      coordinateurId: user.coordinateur.id,
      parametres,
      criteres: criteresDesFiltresDeCoordination(valeurs),
      timezone: user.timezone,
      aussiMediateur: isMediateur(user),
      lectures: {
        activites: listerLesActivitesDeCoordination,
        options: optionsDeFiltre,
      },
    }),
    tagsChoisis(valeurs.tags),
  ])

  const { options, ...pageSansOptions } = page
  const barre = barreDesCoordinations({
    adresse: { chemin: '/coop/mes-coordinations', parametres },
    valeurs,
    options,
    tagsChoisis: tags,
  })

  return (
    <ClientBinder
      bind={SUPPRIMER_LA_COORDINATION_KEY}
      to={supprimerUneActiviteDeCoordinationAction}
    >
      <ClientBinder
        bind={RECHERCHER_DES_TAGS_DU_CRA_KEY}
        to={rechercherDesTagsAction}
      >
        <MesCoordinationsPage
          {...pageSansOptions}
          barreDeFiltres={
            <BarreDesCoordinations
              barre={barre}
              exporter={
                <BoutonExporter {...barre.export} activitesCount={total} />
              }
            />
          }
        />
      </ClientBinder>
    </ClientBinder>
  )
}

export default MesCoordinationsRoute
